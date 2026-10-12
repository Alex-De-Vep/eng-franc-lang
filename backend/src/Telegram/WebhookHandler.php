<?php

declare(strict_types=1);

namespace Iripurtova\Telegram;

use RuntimeException;
use Throwable;

/**
 * Orchestrates the questionnaire state machine and delivery of applications.
 *
 * It is transport-agnostic: the outer webhook endpoint performs the HTTP-level
 * checks (method, body size, JSON, secret) and passes a decoded payload here.
 * All Telegram side effects go through the injected TelegramApiClient.
 */
final class WebhookHandler
{
    public const STEP_CONSENT = 'consent';
    public const STEP_LANGUAGE = 'language';
    public const STEP_NAME = 'name';
    public const STEP_AGE = 'age';
    public const STEP_CITY = 'city';
    public const STEP_COUNTRY = 'country';
    public const STEP_GOAL = 'goal';
    public const STEP_LEVEL = 'level';
    public const STEP_CONTACT = 'contact';
    public const STEP_PHONE = 'phone';

    private const LANGUAGES = ['en', 'fr'];
    private const GOALS = ['travel', 'work', 'study', 'self', 'other'];
    private const LEVELS = ['beginner', 'intermediate', 'advanced', 'unknown'];
    private const CONTACT_METHODS = ['telegram', 'phone'];

    /** @var callable(string): bool */
    private $logger;

    public function __construct(
        private readonly ApiClientInterface $api,
        private readonly SessionRepository $sessions,
        private readonly ApplicationRepository $applications,
        private readonly UpdateDeduplicator $deduplicator,
        private readonly TelegramRateLimiter $rateLimiter,
        private readonly Messages $messages,
        private readonly ApplicationNotifier $notifier,
        private readonly int $teacherChatId,
        private readonly array $retryIntervals,
        ?callable $logger = null,
    ) {
        $this->logger = $logger ?? static fn (string $message): bool => error_log($message);
    }

    /**
     * Processes a normalized update and returns an HTTP status code.
     * Returns 200 for processed/ignored updates, 500 only when the update could
     * not be stored at all.
     */
    public function handle(Update $update): int
    {
        if ($this->deduplicator->alreadyProcessed($update->updateId)) {
            ($this->logger)(sprintf('duplicate_update id=%d', $update->updateId));
            return 200;
        }

        if (!$this->rateLimiter->allowEvent($update->userId)) {
            ($this->logger)(sprintf('event_rate_limited id=%d', $update->updateId));
            $this->sendText($update->chatId, $this->messages->resolve($this->localeFor($update), 'rate_limited'));

            return 200;
        }

        try {
            $this->deduplicator->markProcessed($update->updateId);
            $this->dispatch($update);
        } catch (Throwable $exception) {
            ($this->logger)(sprintf(
                '[telegram][%d] handler_failed %s:%s',
                $update->updateId,
                $exception::class,
                $exception->getCode(),
            ));
            $this->deduplicator->delete($update->updateId);

            return 500;
        }

        return 200;
    }

    private function dispatch(Update $update): void
    {
        if ($update->type === 'message') {
            $this->handleMessage($update);

            return;
        }

        $this->handleCallback($update);
    }

    private function handleMessage(Update $update): void
    {
        $text = $update->text;

        if ($text !== null && str_starts_with(trim($text), '/start')) {
            $this->handleStart($update, (string) $text);

            return;
        }

        if ($text !== null && str_starts_with(trim($text), '/cancel')) {
            $this->sessions->delete($update->userId);
            $this->sendText($update->chatId, $this->messages->resolve($this->localeFor($update), 'cancel'));

            return;
        }

        $session = $this->sessions->find($update->userId);

        if ($session === null) {
            $this->sendText($update->chatId, $this->greeting($this->localeFor($update)));

            return;
        }

        if (!$session->consent) {
            $this->sendText($update->chatId, $this->greeting($session->locale));

            return;
        }

        switch ($session->step) {
            case self::STEP_NAME:
                $this->handleName($update, $session);

                return;
            case self::STEP_AGE:
                $this->handleAge($update, $session);

                return;
            case self::STEP_CITY:
                $this->handleCity($update, $session);

                return;
            case self::STEP_COUNTRY:
                $this->handleCountry($update, $session);

                return;
            case self::STEP_PHONE:
                $this->handlePhone($update, $session);

                return;
            default:
                // A stray text/command while waiting for an inline choice.
                $this->sendText($update->chatId, $this->messages->resolve($session->locale, 'unexpected'));
                $this->reask($update->chatId, $session);
        }
    }

    private function handleCallback(Update $update): void
    {
        $data = (string) $update->callbackData;
        $session = $this->sessions->find($update->userId);
        $startLocale = $this->startCallbackLocale($data);

        // Telegram expects callback_query.id here, not the outer numeric update_id.
        // Acknowledging the callback also stops the loading indicator on the button.
        if ($update->callbackQueryId !== null && $update->callbackQueryId !== '') {
            try {
                $this->api->call('answerCallbackQuery', ['callback_query_id' => $update->callbackQueryId]);
            } catch (Throwable $exception) {
                // Telegram rejects acknowledgements for callbacks that stayed in
                // a retry queue too long. The questionnaire can still advance.
                ($this->logger)(sprintf(
                    '[telegram][%d] callback_ack_failed %s:%s',
                    $update->updateId,
                    $exception::class,
                    $exception->getCode(),
                ));
            }
        }

        if ($session === null) {
            // A callback may reach us after the session file was cleaned up or
            // after Telegram retried an older greeting. Recreate the minimal
            // consent session instead of acknowledging the button silently.
            if ($startLocale === null) {
                ($this->logger)(sprintf('callback_session_missing id=%d', $update->updateId));
                return;
            }

            $session = new Session(
                $update->userId,
                $update->chatId,
                self::STEP_CONSENT,
                $startLocale,
                'direct',
                false,
                [],
                time(),
            );
            $this->sessions->save($session);
            ($this->logger)(sprintf('callback_session_restored id=%d', $update->updateId));
        }

        $locale = $session->locale;

        // Consent is the only button available before consent is recorded.
        if (!$session->consent) {
            if ($startLocale !== null) {
                $this->advance($update, $session, self::STEP_CONSENT, [], self::STEP_LANGUAGE);
            }

            return;
        }

        // Stale callbacks for a different step must not change the current step.
        if (!$this->callbackMatches($data, $session->step)) {
            ($this->logger)(sprintf('stale_callback id=%d', $update->updateId));
            return;
        }

        switch ($session->step) {
            case self::STEP_LANGUAGE:
                if (in_array($data, ['lang_en', 'lang_fr'], true)) {
                    $lang = substr($data, 5);
                    $this->advance($update, $session, self::STEP_LANGUAGE, ['language' => $lang], self::STEP_NAME);
                }

                return;
            case self::STEP_GOAL:
                $goal = $this->stripPrefix($data, 'goal_');
                if ($goal !== null && in_array($goal, self::GOALS, true)) {
                    $this->advance($update, $session, self::STEP_GOAL, ['goal' => $goal], self::STEP_LEVEL);
                }

                return;
            case self::STEP_LEVEL:
                $level = $this->stripPrefix($data, 'level_');
                if ($level !== null && in_array($level, self::LEVELS, true)) {
                    $this->advance($update, $session, self::STEP_LEVEL, ['level' => $level], self::STEP_CONTACT);
                }

                return;
            case self::STEP_CONTACT:
                $method = $this->stripPrefix($data, 'contact_');
                if ($method !== null && in_array($method, self::CONTACT_METHODS, true)) {
                    if ($method === 'telegram') {
                        $this->finishTelegram($update, $session);
                    } else {
                        $this->advance($update, $session, self::STEP_CONTACT, ['contact_method' => 'phone'], self::STEP_PHONE);
                    }
                }
        }
    }

    private function handleStart(Update $update, string $text): void
    {
        // Parse deep link payload: /start website_ru | website_en | website_fr
        $parts = preg_split('/\s+/', trim($text));
        $payload = $parts[1] ?? '';

        $locale = $this->localeFromStart($payload);
        $source = str_starts_with($payload, 'website_') ? $payload : 'direct';

        // Reset only an incomplete questionnaire.
        $this->sessions->delete($update->userId);
        $this->sessions->save(new Session(
            $update->userId,
            $update->chatId,
            self::STEP_CONSENT,
            $locale,
            $source,
            false,
            [],
            time(),
        ));

        $this->sendGreeting($update->chatId, $locale, $source);
    }

    private function handleName(Update $update, Session $session): void
    {
        $text = trim((string) $update->text);
        $length = $this->length($text);

        if ($length < 2 || $length > 100) {
            $this->sendText($update->chatId, $this->messages->resolve($session->locale, 'invalid_name'));

            return;
        }

        $this->advance($update, $session, self::STEP_NAME, ['name' => $text], self::STEP_AGE);
    }

    private function handleAge(Update $update, Session $session): void
    {
        $text = trim((string) $update->text);
        $age = ctype_digit($text) ? (int) $text : 0;

        if ($age < 4 || $age > 100) {
            $this->sendText($update->chatId, $this->messages->resolve($session->locale, 'invalid_age'));

            return;
        }

        $this->advance($update, $session, self::STEP_AGE, ['age' => $age], self::STEP_CITY);
    }

    private function handleCity(Update $update, Session $session): void
    {
        $text = trim((string) $update->text);
        $length = $this->length($text);

        if ($length < 2 || $length > 100) {
            $this->sendText($update->chatId, $this->messages->resolve($session->locale, 'invalid_city'));

            return;
        }

        $this->advance($update, $session, self::STEP_CITY, ['city' => $text], self::STEP_COUNTRY);
    }

    private function handleCountry(Update $update, Session $session): void
    {
        $text = trim((string) $update->text);
        $length = $this->length($text);

        if ($length < 2 || $length > 100) {
            $this->sendText($update->chatId, $this->messages->resolve($session->locale, 'invalid_country'));

            return;
        }

        $this->advance($update, $session, self::STEP_COUNTRY, ['country' => $text], self::STEP_GOAL);
    }

    private function handlePhone(Update $update, Session $session): void
    {
        $contact = $update->contact;
        $locale = $session->locale;

        if (is_array($contact)) {
            // A shared contact is accepted only when it belongs to the sender.
            $contactUserId = $contact['user_id'] ?? null;
            if ((int) $contactUserId !== $update->userId) {
                $this->sendText($update->chatId, $this->messages->resolve($locale, 'wrong_contact'));

                return;
            }

            $phone = $this->normalizePhone((string) ($contact['phone_number'] ?? ''));
            if ($phone === '') {
                $this->sendText($update->chatId, $this->messages->resolve($locale, 'invalid_phone'));

                return;
            }

            $this->advance($update, $session, self::STEP_PHONE, ['contact_phone' => $phone], null);

            return;
        }

        $phone = $this->normalizePhone((string) $update->text);
        if ($phone === '') {
            $this->sendText($update->chatId, $this->messages->resolve($locale, 'invalid_phone'));

            return;
        }

        $this->advance($update, $session, self::STEP_PHONE, ['contact_phone' => $phone], null);
    }

    private function finishTelegram(Update $update, Session $session): void
    {
        $answers = $session->answers;
        $answers['contact_method'] = 'telegram';
        $answers['contact_user_id'] = $update->userId;
        $answers['contact_username'] = $update->username ?? '';

        $this->finalize($update, $session, $answers);
    }

    /**
     * Persists a step change and re-asks or finalizes. When $nextStep is null
     * the questionnaire is complete and the application is stored and sent.
     *
     * @param array<string, mixed> $answers
     */
    private function advance(Update $update, Session $session, string $completedStep, array $answers, ?string $nextStep = null): void
    {
        $nextLocale = $session->locale;

        $merged = array_replace($session->answers, $answers);
        $merged['source'] = $session->source;
        $merged['locale'] = $nextLocale;

        if ($nextStep === null) {
            $complete = new Session(
                $session->userId,
                $session->chatId,
                $session->step,
                $nextLocale,
                $session->source,
                true,
                $merged,
                time(),
            );
            $this->finalize($update, $complete, $merged);

            return;
        }

        $next = new Session(
            $session->userId,
            $session->chatId,
            $nextStep,
            $nextLocale,
            $session->source,
            true,
            $merged,
            time(),
        );
        $this->sessions->save($next);
        $this->reask($update->chatId, $next);
    }

    private function finalize(Update $update, Session $session, array $answers): void
    {
        // The locale may already be stored in answers; keep it consistent.
        $locale = $session->locale;

        if (!$this->rateLimiter->allowApplication($update->userId)) {
            $this->sendText($update->chatId, $this->messages->resolve($locale, 'rate_limited'));

            return;
        }

        $application = new Application(
            bin2hex(random_bytes(8)),
            $update->userId,
            $update->chatId,
            $answers,
            'pending',
            0,
            time(),
            null,
            time(),
        );

        // The application must be durably stored BEFORE any sendMessage call.
        $this->applications->save($application);

        try {
            $this->api->call('sendMessage', [
                'chat_id' => $this->teacherChatId,
                'text' => $this->notifier->render($application, $update->userId),
                'parse_mode' => 'HTML',
            ]);

            $this->applications->markDelivered($application->applicationId);
            $this->sessions->delete($update->userId);
            $this->sendText($update->chatId, $this->messages->resolve($locale, 'sent'));
        } catch (TransientApiException) {
            // Queue for retry; the session is cleared only after safe queueing.
            $this->sessions->delete($update->userId);
            $this->sendText($update->chatId, $this->messages->resolve($locale, 'queued'));
        } catch (ApiException) {
            // Permanent bot-level error: also queue for a bounded retry.
            $this->sessions->delete($update->userId);
            $this->sendText($update->chatId, $this->messages->resolve($locale, 'queued'));
        }
    }

    // --- outbound helpers -------------------------------------------------

    private function sendGreeting(int $chatId, string $locale, string $source): void
    {
        $greeting = $this->messages->resolve($locale, 'greeting');
        $primaryKey = $source === 'direct' ? 'start' : 'consent_note';
        $text = $greeting;

        $this->api->call('sendMessage', [
            'chat_id' => $chatId,
            'text' => $text,
            'reply_markup' => [
                'inline_keyboard' => [[
                    ['text' => $this->messages->resolve($locale, 'start'), 'callback_data' => 'start_' . $locale],
                ]],
            ],
        ]);
    }

    private function greeting(string $locale): string
    {
        return $this->messages->resolve($locale, 'greeting');
    }

    private function reask(int $chatId, Session $session): void
    {
        $locale = $session->locale;

        switch ($session->step) {
            case self::STEP_LANGUAGE:
                $this->ask($chatId, $locale, 'choose_language', [
                    ['lang_en', 'lang_fr'],
                ]);
                break;
            case self::STEP_NAME:
                $this->sendText($chatId, $this->messages->resolve($locale, 'ask_name'));
                break;
            case self::STEP_AGE:
                $this->sendText($chatId, $this->messages->resolve($locale, 'ask_age'));
                break;
            case self::STEP_CITY:
                $this->sendText($chatId, $this->messages->resolve($locale, 'ask_city'));
                break;
            case self::STEP_COUNTRY:
                $this->sendText($chatId, $this->messages->resolve($locale, 'ask_country'));
                break;
            case self::STEP_GOAL:
                $this->ask($chatId, $locale, 'ask_goal', [
                    ['goal_travel', 'goal_work'],
                    ['goal_study', 'goal_self'],
                    ['goal_other'],
                ]);
                break;
            case self::STEP_LEVEL:
                $this->ask($chatId, $locale, 'ask_level', [
                    ['level_beginner', 'level_intermediate'],
                    ['level_advanced', 'level_unknown'],
                ]);
                break;
            case self::STEP_CONTACT:
                $this->ask($chatId, $locale, 'ask_contact', [
                    ['contact_telegram', 'contact_phone'],
                ]);
                break;
            case self::STEP_PHONE:
                $this->api->call('sendMessage', [
                    'chat_id' => $chatId,
                    'text' => $this->messages->resolve($locale, 'ask_phone'),
                    'reply_markup' => [
                        'keyboard' => [[
                            ['text' => $this->messages->resolve($locale, 'send_contact'), 'request_contact' => true],
                        ]],
                        'resize_keyboard' => true,
                        'one_time_keyboard' => true,
                    ],
                ]);
                break;
        }
    }

    /** @param list<list<string>> $choices */
    private function ask(int $chatId, string $locale, string $questionKey, array $choices): void
    {
        $keyboard = array_map(static fn (array $row): array => array_map(
            static fn (string $key): array => [
                'text' => self::messages()->resolve($locale, self::labelForKey($key)),
                'callback_data' => $key,
            ],
            $row,
        ), $choices);

        $this->api->call('sendMessage', [
            'chat_id' => $chatId,
            'text' => $this->messages->resolve($locale, $questionKey),
            'reply_markup' => ['inline_keyboard' => $keyboard],
        ]);
    }

    private static function messages(): Messages
    {
        static $instance = null;

        return $instance ??= new Messages();
    }

    private function sendText(int $chatId, string $text): void
    {
        $this->api->call('sendMessage', ['chat_id' => $chatId, 'text' => $text]);
    }

    // --- helpers ----------------------------------------------------------

    private static function labelForKey(string $key): string
    {
        return match (true) {
            $key === 'lang_en' => 'language_en',
            $key === 'lang_fr' => 'language_fr',
            str_starts_with($key, 'goal_') => $key,
            str_starts_with($key, 'level_') => $key,
            str_starts_with($key, 'contact_') => $key,
            default => $key,
        };
    }

    private function callbackMatches(string $data, string $step): bool
    {
        return match ($step) {
            self::STEP_LANGUAGE => str_starts_with($data, 'lang_'),
            self::STEP_GOAL => str_starts_with($data, 'goal_'),
            self::STEP_LEVEL => str_starts_with($data, 'level_'),
            self::STEP_CONTACT => str_starts_with($data, 'contact_'),
            default => false,
        };
    }

    private function stripPrefix(string $data, string $prefix): ?string
    {
        return str_starts_with($data, $prefix) ? substr($data, strlen($prefix)) : null;
    }

    private function startCallbackLocale(string $data): ?string
    {
        // Keep accepting buttons sent by previous deployments.
        if ($data === 'start') {
            return 'en';
        }

        $locale = $this->stripPrefix($data, 'start_');

        return $locale !== null && $this->messages->isSupported($locale) ? $locale : null;
    }

    private function normalizePhone(string $raw): string
    {
        $digits = preg_replace('/\D+/', '', $raw) ?? '';
        $length = strlen($digits);

        return $length >= 7 && $length <= 15 ? $digits : '';
    }

    private function length(string $value): int
    {
        return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
    }

    private function localeFor(Update $update): string
    {
        return 'en';
    }

    private function localeFromStart(string $payload): string
    {
        if (str_starts_with($payload, 'website_')) {
            $code = substr($payload, 8);
            if ($this->messages->isSupported($code)) {
                return $code;
            }
        }

        // Direct bot launches default to English. Localized website links pass
        // website_ru, website_en or website_fr explicitly above.
        return 'en';
    }
}
