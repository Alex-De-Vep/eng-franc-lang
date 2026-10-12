<?php

declare(strict_types=1);

use Iripurtova\Telegram\ApplicationNotifier;
use Iripurtova\Telegram\ApplicationRepository;
use Iripurtova\Telegram\Messages;
use Iripurtova\Telegram\SessionRepository;
use Iripurtova\Telegram\TelegramApiClient;
use Iripurtova\Telegram\TelegramConfig;
use Iripurtova\Telegram\TelegramRateLimiter;
use Iripurtova\Telegram\UpdateDeduplicator;
use Iripurtova\Telegram\UpdateValidator;
use Iripurtova\Telegram\WebhookHandler;

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

const MAX_BODY_BYTES = 262_144;

$requestId = bin2hex(random_bytes(8));
$startedAt = hrtime(true);
$stage = 'runtime';
$logRequest = false;
$log = static fn (string $message): bool => error_log(sprintf('[telegram][%s] %s', $requestId, $message));

// Record PHP-level fatal errors without printing potentially sensitive messages.
register_shutdown_function(static function () use ($log, &$stage): void {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        $log(sprintf('fatal stage=%s type=%d', $stage, $error['type']));
    }
});

$runtimeRoot = is_file(__DIR__ . '/vendor/autoload.php') ? __DIR__ : dirname(__DIR__);
$autoloadPath = $runtimeRoot . '/vendor/autoload.php';
$documentRoot = isset($_SERVER['DOCUMENT_ROOT']) ? rtrim((string) $_SERVER['DOCUMENT_ROOT'], DIRECTORY_SEPARATOR) : '';
$configPath = $documentRoot === '' ? '' : dirname($documentRoot) . '/private/telegram-config.php';

$respond = static function (int $status, array $body) use ($log, $startedAt, &$stage, &$logRequest): never {
    if ($logRequest) {
        $log(sprintf('response status=%d stage=%s elapsed_ms=%d', $status, $stage, (int) round((hrtime(true) - $startedAt) / 1_000_000)));
    }
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
};

if (!is_file($autoloadPath) || $configPath === '' || !is_file($configPath)) {
    $log('runtime_configuration_missing');
    $respond(500, ['ok' => false, 'error' => 'UNAVAILABLE']);
}

require $autoloadPath;

// Method check: only POST is accepted.
if (strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? '')) !== 'POST') {
    header('Allow: POST');
    $respond(405, ['ok' => false, 'error' => 'METHOD_NOT_ALLOWED']);
}

// Reject non-JSON content types.
$contentType = strtolower(trim(explode(';', (string) ($_SERVER['CONTENT_TYPE'] ?? ''))[0]));
if ($contentType !== 'application/json') {
    $respond(200, ['ok' => false, 'error' => 'UNSUPPORTED_MEDIA_TYPE']);
}

$rawBody = file_get_contents('php://input') ?: '';
if (strlen($rawBody) > MAX_BODY_BYTES) {
    $respond(200, ['ok' => false, 'error' => 'TOO_LARGE']);
}

try {
    $stage = 'config';
    $config = TelegramConfig::fromArray((array) require $configPath, $documentRoot);

    $providedSecret = (string) ($_SERVER['HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN'] ?? '');
    $expectedSecret = (string) $config->get('webhook_secret', '');
    if ($providedSecret === '' || !hash_equals($expectedSecret, $providedSecret)) {
        $respond(403, ['ok' => false, 'error' => 'FORBIDDEN']);
    }

    $logRequest = true;
    $stage = 'validation';
    $log('received');

    $payload = json_decode($rawBody, true, 32, JSON_THROW_ON_ERROR);
    if (!is_array($payload)) {
        $respond(200, ['ok' => false, 'error' => 'INVALID_JSON']);
    }

    $update = (new UpdateValidator())->normalize($payload);
    if ($update === null) {
        // Non-private or unsupported event: safely ignored.
        $respond(200, ['ok' => true, 'ignored' => true]);
    }

    $storage = (string) $config->get('storage_dir', '');
    $token = (string) $config->get('bot_token', '');
    $timeouts = is_array($config->get('timeouts')) ? $config->get('timeouts') : [];
    $rateLimit = is_array($config->get('rate_limit')) ? $config->get('rate_limit') : [];

    $stage = 'processing';
    $log(sprintf('update id=%d type=%s', $update->updateId, $update->type));

    $handler = new WebhookHandler(
        new TelegramApiClient(
            $token,
            (int) ($timeouts['connect'] ?? 5),
            (int) ($timeouts['request'] ?? 12),
            $log,
        ),
        new SessionRepository($storage),
        new ApplicationRepository($storage),
        new UpdateDeduplicator($storage),
        new TelegramRateLimiter(
            $storage,
            (string) ($rateLimit['rate_limit_secret'] ?? ''),
            (int) ($rateLimit['events_per_minute'] ?? 30),
            (int) ($rateLimit['applications_per_day'] ?? 3),
        ),
        new Messages(),
        new ApplicationNotifier((string) $config->get('timezone', 'Europe/Moscow')),
        (int) $config->get('teacher_chat_id', 0),
        is_array($config->get('retry_intervals')) ? $config->get('retry_intervals') : [300, 900, 3600, 21600, 86400],
        $log,
    );

    $status = $handler->handle($update);
    $respond($status, ['ok' => $status === 200]);
} catch (Throwable $exception) {
    $reason = match ($exception->getMessage()) {
        'Missing bot_token.' => 'missing_bot_token',
        'Missing webhook_secret.' => 'missing_webhook_secret',
        'Missing teacher_chat_id.' => 'missing_teacher_chat_id',
        'Missing storage_dir.' => 'missing_storage_dir',
        'Invalid rate limiter configuration.' => 'invalid_rate_limit',
        'Unable to create directory.' => 'storage_directory_unwritable',
        'Unable to open lock file.' => 'storage_lock_unwritable',
        'Unable to create temporary file.' => 'storage_file_unwritable',
        'Unable to commit file.' => 'storage_commit_failed',
        default => 'runtime_error',
    };
    $logRequest = true;
    $log(sprintf('bootstrap_failed stage=%s reason=%s exception=%s:%s', $stage, $reason, $exception::class, $exception->getCode()));
    $respond(500, ['ok' => false, 'error' => 'UNAVAILABLE']);
}
