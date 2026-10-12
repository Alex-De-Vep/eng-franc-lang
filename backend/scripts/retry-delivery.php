<?php

declare(strict_types=1);

use Iripurtova\Telegram\ApiException;
use Iripurtova\Telegram\Application;
use Iripurtova\Telegram\ApplicationNotifier;
use Iripurtova\Telegram\ApplicationRepository;
use Iripurtova\Telegram\SessionRepository;
use Iripurtova\Telegram\TelegramApiClient;
use Iripurtova\Telegram\TransientApiException;

/**
 * Cron: retries delivery of pending applications. Run every 5 minutes.
 */

/** @var \Iripurtova\Telegram\TelegramConfig $config */
$config = require __DIR__ . '/_bootstrap.php';

$storage = (string) $config->get('storage_dir', '');
$token = (string) $config->get('bot_token', '');
$teacherChatId = (int) $config->get('teacher_chat_id', 0);
$timeouts = is_array($config->get('timeouts')) ? $config->get('timeouts') : [];
$retryIntervals = is_array($config->get('retry_intervals')) ? $config->get('retry_intervals') : [300, 900, 3600, 21600, 86400];

$api = new TelegramApiClient(
    $token,
    (int) ($timeouts['connect'] ?? 5),
    (int) ($timeouts['request'] ?? 12),
);
$applications = new ApplicationRepository($storage);
$sessions = new SessionRepository($storage);
$notifier = new ApplicationNotifier((string) $config->get('timezone', 'Europe/Moscow'));

$delivered = 0;
$failed = 0;

$safeCode = static function (Throwable $exception): string {
    $class = $exception::class;
    $code = (string) $exception->getCode();

    // Never persist exception messages that may embed sensitive values.
    return preg_replace('/[^a-zA-Z0-9_:.]/', '_', $class . ':' . $code) ?? 'error';
};

foreach ($applications->pendingReady() as $application) {
    $applicationId = $application->applicationId;

    try {
        $api->call('sendMessage', [
            'chat_id' => $teacherChatId,
            'text' => $notifier->render($application, (int) ($application->answers['contact_user_id'] ?? 0)),
            'parse_mode' => 'HTML',
        ]);

        $applications->markDelivered($applicationId);
        ++$delivered;

        // Send a single follow-up confirmation to the applicant.
        try {
            $api->call('sendMessage', [
                'chat_id' => $application->chatId,
                'text' => '✅ Ваша заявка передана преподавателю.',
            ]);
        } catch (Throwable) {
            // Best effort: the application itself is already delivered.
        }
    } catch (TransientApiException | ApiException $exception) {
        // Advance the retry schedule.
        $attempts = $application->attempts + 1;
        $index = min($attempts - 1, count($retryIntervals) - 1);
        $delay = $index >= 0 ? $retryIntervals[$index] : $retryIntervals[count($retryIntervals) - 1];

        $updated = new Application(
            $applicationId,
            $application->userId,
            $application->chatId,
            $application->answers,
            'pending',
            $attempts,
            time() + $delay,
            $safeCode($exception),
            $application->createdAt,
        );
        $applications->save($updated);
        ++$failed;
    }
}

echo sprintf("retry-delivery: delivered=%d failed=%d\n", $delivered, $failed);
