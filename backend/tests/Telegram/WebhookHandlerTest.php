<?php

declare(strict_types=1);

namespace Iripurtova\Telegram\Tests;

use Iripurtova\Telegram\ApplicationNotifier;
use Iripurtova\Telegram\ApplicationRepository;
use Iripurtova\Telegram\Messages;
use Iripurtova\Telegram\SessionRepository;
use Iripurtova\Telegram\TelegramRateLimiter;
use Iripurtova\Telegram\Update;
use Iripurtova\Telegram\UpdateDeduplicator;
use Iripurtova\Telegram\WebhookHandler;
use PHPUnit\Framework\TestCase;

final class WebhookHandlerTest extends TestCase
{
    private string $storage;

    protected function setUp(): void
    {
        $this->storage = sys_get_temp_dir() . '/tg-bot-test-' . bin2hex(random_bytes(6));
    }

    protected function tearDown(): void
    {
        $this->removeTree($this->storage);
    }

    private function handler(FakeApiClient $api, int $teacherChatId = 111): WebhookHandler
    {
        return new WebhookHandler(
            $api,
            new SessionRepository($this->storage),
            new ApplicationRepository($this->storage),
            new UpdateDeduplicator($this->storage),
            new TelegramRateLimiter($this->storage, 'test-rate-secret', 30, 3),
            new Messages(),
            new ApplicationNotifier('Europe/Moscow'),
            $teacherChatId,
            [300, 900, 3600, 21_600, 86_400],
        );
    }

    private function message(int $updateId, string $text, string $lang = 'en', int $userId = 42, int $chatId = 42): Update
    {
        return new Update($updateId, 'message', $userId, $chatId, $text, null, $lang, 'someuser', null);
    }

    private function cb(int $updateId, string $data, int $userId = 42, int $chatId = 42, string $lang = 'en', ?string $username = 'someuser'): Update
    {
        return new Update($updateId, 'callback_query', $userId, $chatId, null, $data, $lang, $username, null, 'callback-' . $updateId);
    }

    public function testStartWithWebsiteLocaleAndConsentFlow(): void
    {
        $api = new FakeApiClient();
        $handler = $this->handler($api);

        $status = $handler->handle($this->message(1, '/start website_fr', 'ru'));
        self::assertSame(200, $status);

        // Greeting sent with a Start button.
        $greeting = $api->callWithMethod('sendMessage');
        self::assertNotNull($greeting);
        self::assertStringContainsString('Bonjour', $greeting['text']);
        self::assertSame('start_fr', $greeting['reply_markup']['inline_keyboard'][0][0]['callback_data']);

        // Consent callback advances to language selection.
        $handler->handle($this->cb(2, 'start', 42, 42, 'fr'));
        self::assertSame(
            'callback-2',
            $api->payloadsOf('answerCallbackQuery')[0]['callback_query_id'],
        );
        $languageAsk = $api->payloadsOf('sendMessage');
        self::assertNotEmpty($languageAsk);
        $last = end($languageAsk);
        self::assertStringContainsString('Quelle langue', $last['text']);
    }

    public function testDirectStartDefaultsToEnglishRegardlessOfTelegramLanguage(): void
    {
        $api = new FakeApiClient();
        $handler = $this->handler($api);

        $handler->handle($this->message(1, '/start', 'ru'));
        $greeting = $api->callWithMethod('sendMessage');
        self::assertStringContainsString('Hello', $greeting['text']);
        self::assertSame('start_en', $greeting['reply_markup']['inline_keyboard'][0][0]['callback_data']);
    }

    public function testStartButtonRecoversMissingSessionAndPreservesEncodedLocale(): void
    {
        $api = new FakeApiClient();
        $handler = $this->handler($api);

        $status = $handler->handle($this->cb(1, 'start_ru', 42, 42, 'en'));

        self::assertSame(200, $status);
        $messages = $api->payloadsOf('sendMessage');
        $last = end($messages);
        self::assertStringContainsString('Какой язык', $last['text']);

        $session = (new SessionRepository($this->storage))->find(42);
        self::assertNotNull($session);
        self::assertSame(WebhookHandler::STEP_LANGUAGE, $session->step);
        self::assertSame('ru', $session->locale);
        self::assertTrue($session->consent);
    }

    public function testLearningLanguageDoesNotChangeQuestionnaireLocale(): void
    {
        $api = new FakeApiClient();
        $handler = $this->handler($api);

        $handler->handle($this->message(1, '/start website_ru', 'en'));
        $handler->handle($this->cb(2, 'start'));
        $handler->handle($this->cb(3, 'lang_en'));

        $messages = $api->payloadsOf('sendMessage');
        $last = end($messages);
        self::assertSame('Пожалуйста, напишите ваше имя.', $last['text']);

        $session = (new SessionRepository($this->storage))->find(42);
        self::assertSame('ru', $session->locale);
        self::assertSame('en', $session->answers['language']);
    }

    public function testExpiredCallbackAcknowledgementDoesNotBlockQuestionnaire(): void
    {
        $api = new FakeApiClient();
        $handler = $this->handler($api);

        $handler->handle($this->message(1, '/start website_en', 'ru'));
        $api->throwOnMethod = 'answerCallbackQuery';
        $api->failMethod = 'permanent';

        $status = $handler->handle($this->cb(2, 'start'));

        self::assertSame(200, $status);
        $messages = $api->payloadsOf('sendMessage');
        $last = end($messages);
        self::assertStringContainsString('Which language', $last['text']);
    }

    public function testFullQuestionnaireProducesDeliveredApplication(): void
    {
        $api = new FakeApiClient();
        $handler = $this->handler($api);

        $handler->handle($this->message(1, '/start', 'en'));
        $handler->handle($this->cb(2, 'start'));           // consent
        $handler->handle($this->cb(3, 'lang_en'));         // language
        $handler->handle($this->message(4, 'Jane'));       // name
        $handler->handle($this->message(5, '31'));         // age
        $handler->handle($this->message(6, 'Paris'));      // city
        $handler->handle($this->message(7, 'France'));     // country
        $handler->handle($this->cb(8, 'goal_work'));       // goal
        $handler->handle($this->cb(9, 'level_beginner'));  // level
        $handler->handle($this->cb(10, 'contact_telegram')); // contact

        // The teacher received exactly one sendMessage beyond the question flow.
        $teacherMessage = $this->teacherMessage($api);
        self::assertNotNull($teacherMessage);
        self::assertStringContainsString('Jane', $teacherMessage['text']);
        self::assertStringContainsString('Возраст: 31', $teacherMessage['text']);
        self::assertStringContainsString('Город: Paris', $teacherMessage['text']);
        self::assertStringContainsString('Страна: France', $teacherMessage['text']);
        self::assertStringContainsString('Английский', $teacherMessage['text']);
        self::assertStringContainsString('someuser', $teacherMessage['text']);

        // Answer query acknowledgements were sent for every callback.
        self::assertGreaterThanOrEqual(5, count($api->payloadsOf('answerCallbackQuery')));

        // Application is now delivered.
        $repo = new ApplicationRepository($this->storage);
        $pending = $repo->pendingReady();
        self::assertCount(0, $pending);
    }

    public function testTransientErrorLeavesApplicationPendingAndSessionCleared(): void
    {
        $api = new FakeApiClient();
        $api->failSendMessageToChat = 111; // fail teacher delivery
        $handler = $this->handler($api);

        $this->runUntilFinalDelivery($handler);

        $repo = new ApplicationRepository($this->storage);
        $pending = $repo->pendingReady();
        self::assertCount(1, $pending);
        self::assertSame('pending', $pending[0]->status);

        // Session was deleted after queueing.
        $sessions = new SessionRepository($this->storage);
        self::assertNull($sessions->find(42));

        // User received the queued notice.
        $userMessages = array_filter(
            $api->payloadsOf('sendMessage'),
            static fn (array $p): bool => ($p['chat_id'] ?? null) === 42,
        );
        $lastUserMessage = end($userMessages);
        self::assertStringContainsString('automatically', $lastUserMessage['text']);
    }

    public function testContactWithAndWithoutUsername(): void
    {
        // With username.
        $api = new FakeApiClient();
        $handler = $this->handler($api);
        $handler->handle($this->message(1, '/start', 'en'));
        $handler->handle($this->cb(2, 'start'));
        $handler->handle($this->cb(3, 'lang_en'));
        $handler->handle($this->message(4, 'Jane'));
        $handler->handle($this->message(5, '31'));
        $handler->handle($this->message(6, 'Paris'));
        $handler->handle($this->message(7, 'France'));
        $handler->handle($this->cb(8, 'goal_work'));
        $handler->handle($this->cb(9, 'level_beginner'));
        $handler->handle($this->cb(10, 'contact_telegram'));

        $teacherMessage = $this->teacherMessage($api);
        self::assertStringContainsString('@someuser', $teacherMessage['text']);

        // Without username: fallback to tg://user?id link.
        $api2 = new FakeApiClient();
        $handler2 = $this->handler($api2);
        $noUser = new Update(11, 'message', 77, 77, '/start', null, 'en', null, null);
        $handler2->handle($noUser);
        $handler2->handle($this->cb(12, 'start', 77, 77, 'en', null));
        $handler2->handle($this->cb(13, 'lang_en', 77, 77, 'en', null));
        $handler2->handle(new Update(14, 'message', 77, 77, 'Bob', null, 'en', null, null));
        $handler2->handle(new Update(15, 'message', 77, 77, '29', null, 'en', null, null));
        $handler2->handle(new Update(16, 'message', 77, 77, 'London', null, 'en', null, null));
        $handler2->handle(new Update(17, 'message', 77, 77, 'United Kingdom', null, 'en', null, null));
        $handler2->handle($this->cb(18, 'goal_self', 77, 77, 'en', null));
        $handler2->handle($this->cb(19, 'level_advanced', 77, 77, 'en', null));
        $handler2->handle($this->cb(20, 'contact_telegram', 77, 77, 'en', null));

        $teacherMessage2 = $this->teacherMessage($api2);
        self::assertStringContainsString('tg://user?id=77', $teacherMessage2['text']);
    }

    public function testPhoneViaManualTextIsNormalized(): void
    {
        $api = new FakeApiClient();
        $handler = $this->handler($api);
        $handler->handle($this->message(1, '/start', 'en'));
        $handler->handle($this->cb(2, 'start'));
        $handler->handle($this->cb(3, 'lang_en'));
        $handler->handle($this->message(4, 'Jane'));
        $handler->handle($this->message(5, '31'));
        $handler->handle($this->message(6, 'Paris'));
        $handler->handle($this->message(7, 'France'));
        $handler->handle($this->cb(8, 'goal_work'));
        $handler->handle($this->cb(9, 'level_beginner'));
        $handler->handle($this->cb(10, 'contact_phone'));
        $handler->handle($this->message(11, '+7 (900) 123-45-67'));

        $teacherMessage = $this->teacherMessage($api);
        self::assertStringContainsString('79001234567', $teacherMessage['text']);
    }

    public function testForeignContactIsRejected(): void
    {
        $api = new FakeApiClient();
        $handler = $this->handler($api);
        $handler->handle($this->message(1, '/start', 'en'));
        $handler->handle($this->cb(2, 'start'));
        $handler->handle($this->cb(3, 'lang_en'));
        $handler->handle($this->message(4, 'Jane'));
        $handler->handle($this->message(5, '31'));
        $handler->handle($this->message(6, 'Paris'));
        $handler->handle($this->message(7, 'France'));
        $handler->handle($this->cb(8, 'goal_work'));
        $handler->handle($this->cb(9, 'level_beginner'));
        $handler->handle($this->cb(10, 'contact_phone'));

        // A contact that belongs to another user (99).
        $foreign = new Update(11, 'message', 42, 42, null, null, 'en', null, ['phone_number' => '+79991112233', 'user_id' => 99]);
        $handler->handle($foreign);

        $userMessages = array_filter(
            $api->payloadsOf('sendMessage'),
            static fn (array $p): bool => ($p['chat_id'] ?? null) === 42,
        );
        $last = end($userMessages);
        self::assertStringContainsString('another user', $last['text']);
    }

    public function testDeduplicateSameUpdateId(): void
    {
        $api = new FakeApiClient();
        $handler = $this->handler($api);

        $handler->handle($this->message(1, '/start', 'en'));
        $firstCount = count($api->calls);
        $handler->handle($this->message(1, '/start', 'en'));
        self::assertSame($firstCount, count($api->calls));
    }

    public function testCancelDeletesIncompleteSession(): void
    {
        $api = new FakeApiClient();
        $handler = $this->handler($api);

        $handler->handle($this->message(1, '/start', 'en'));
        $handler->handle($this->message(2, '/cancel', 'en'));
        self::assertNotNull($api->callWithMethod('sendMessage'));

        $sessions = new SessionRepository($this->storage);
        self::assertNull($sessions->find(42));
    }

    public function testStaleCallbackDoesNotChangeStep(): void
    {
        $api = new FakeApiClient();
        $handler = $this->handler($api);

        $handler->handle($this->message(1, '/start', 'en'));
        $handler->handle($this->cb(2, 'start'));
        // A goal callback arriving while still at the language step is ignored.
        $handler->handle($this->cb(3, 'goal_travel'));

        $sessions = new SessionRepository($this->storage);
        $session = $sessions->find(42);
        self::assertSame(WebhookHandler::STEP_LANGUAGE, $session->step);
    }

    public function testRateLimiterBlocksEvents(): void
    {
        $storage = sys_get_temp_dir() . '/tg-rate-' . bin2hex(random_bytes(6));

        try {
            $limiter = new TelegramRateLimiter($storage, 's', 2, 3);
            self::assertTrue($limiter->allowEvent(7));
            self::assertTrue($limiter->allowEvent(7));
            self::assertFalse($limiter->allowEvent(7));
        } finally {
            $this->removeTree($storage);
        }
    }

    public function testNameRejectsTooShortInput(): void
    {
        $api = new FakeApiClient();
        $handler = $this->handler($api);

        $handler->handle($this->message(1, '/start', 'en'));
        $handler->handle($this->cb(2, 'start'));
        $handler->handle($this->cb(3, 'lang_en'));
        $handler->handle($this->message(4, 'A')); // one char -> invalid

        $sendMessages = $api->payloadsOf('sendMessage');
        $last = end($sendMessages);
        self::assertStringContainsString('2 to 100', $last['text']);

        $sessions = new SessionRepository($this->storage);
        self::assertSame(WebhookHandler::STEP_NAME, $sessions->find(42)->step);
    }

    public function testAgeCityAndCountryAreValidated(): void
    {
        $api = new FakeApiClient();
        $handler = $this->handler($api);

        $handler->handle($this->message(1, '/start website_en', 'ru'));
        $handler->handle($this->cb(2, 'start'));
        $handler->handle($this->cb(3, 'lang_fr'));
        $handler->handle($this->message(4, 'Jane'));

        $handler->handle($this->message(5, 'unknown'));
        $messages = $api->payloadsOf('sendMessage');
        self::assertStringContainsString('between 4 and 100', end($messages)['text']);
        self::assertSame(WebhookHandler::STEP_AGE, (new SessionRepository($this->storage))->find(42)->step);

        $handler->handle($this->message(6, '28'));
        $handler->handle($this->message(7, 'X'));
        $messages = $api->payloadsOf('sendMessage');
        self::assertStringContainsString('city name', end($messages)['text']);

        $handler->handle($this->message(8, 'Lyon'));
        $handler->handle($this->message(9, 'F'));
        $messages = $api->payloadsOf('sendMessage');
        self::assertStringContainsString('country name', end($messages)['text']);

        $handler->handle($this->message(10, 'France'));
        $session = (new SessionRepository($this->storage))->find(42);
        self::assertSame(WebhookHandler::STEP_GOAL, $session->step);
        self::assertSame(28, $session->answers['age']);
        self::assertSame('Lyon', $session->answers['city']);
        self::assertSame('France', $session->answers['country']);
        self::assertSame('en', $session->locale);
        self::assertSame('fr', $session->answers['language']);
    }

    public function testHtmlInjectionIsEscapedInTeacherNotification(): void
    {
        $api = new FakeApiClient();
        $handler = $this->handler($api);

        $handler->handle($this->message(1, '/start', 'en'));
        $handler->handle($this->cb(2, 'start'));
        $handler->handle($this->cb(3, 'lang_en'));
        $handler->handle($this->message(4, '<script>alert(1)</script>'));
        $handler->handle($this->message(5, '31'));
        $handler->handle($this->message(6, '<b>Paris</b>'));
        $handler->handle($this->message(7, 'France'));
        $handler->handle($this->cb(8, 'goal_self'));
        $handler->handle($this->cb(9, 'level_unknown'));
        $handler->handle($this->cb(10, 'contact_telegram'));

        $teacherMessage = $this->teacherMessage($api);
        self::assertStringNotContainsString('<script>', $teacherMessage['text']);
        self::assertStringContainsString('&lt;script&gt;', $teacherMessage['text']);
    }

    private function runUntilFinalDelivery(WebhookHandler $handler): void
    {
        $handler->handle($this->message(1, '/start', 'en'));
        $handler->handle($this->cb(2, 'start'));
        $handler->handle($this->cb(3, 'lang_en'));
        $handler->handle($this->message(4, 'Jane'));
        $handler->handle($this->message(5, '31'));
        $handler->handle($this->message(6, 'Paris'));
        $handler->handle($this->message(7, 'France'));
        $handler->handle($this->cb(8, 'goal_work'));
        $handler->handle($this->cb(9, 'level_beginner'));
        $handler->handle($this->cb(10, 'contact_telegram'));
    }

    /** @return array<string, mixed>|null */
    private function teacherMessage(FakeApiClient $api): ?array
    {
        foreach ($api->payloadsOf('sendMessage') as $payload) {
            if (($payload['chat_id'] ?? null) === 111) {
                return $payload;
            }
        }

        return null;
    }

    private function removeTree(string $directory): void
    {
        if (!is_dir($directory)) {
            return;
        }
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($directory, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST,
        );
        foreach ($iterator as $file) {
            $file->isDir() ? rmdir($file->getPathname()) : unlink($file->getPathname());
        }
        rmdir($directory);
    }
}
