<?php

declare(strict_types=1);

use Iripurtova\Telegram\TelegramApiClient;

/** @var \Iripurtova\Telegram\TelegramConfig $config */
$config = require __DIR__ . '/_bootstrap.php';

$timeouts = is_array($config->get('timeouts')) ? $config->get('timeouts') : [];
$client = new TelegramApiClient(
    (string) $config->get('bot_token', ''),
    (int) ($timeouts['connect'] ?? 5),
    (int) ($timeouts['request'] ?? 12),
    static function (string $message): void { echo $message . "\n"; },
);

echo 'Checked at: ' . gmdate('Y-m-d\TH:i:s\Z') . "\n";
echo 'PHP: ' . PHP_VERSION . '; SAPI: ' . PHP_SAPI . "\n";
echo 'Read-only check: this script does not register webhooks or process updates.' . "\n\n";

$failed = false;
foreach (['getMe', 'getWebhookInfo'] as $method) {
    echo $method . ":\n";
    try {
        $result = $client->call($method, []);
        echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n\n";
    } catch (Throwable $exception) {
        $failed = true;
        // No raw exception message: it may contain server or API details.
        echo 'Check failed: ' . $exception::class . "\n\n";
    }
}
exit($failed ? 1 : 0);
