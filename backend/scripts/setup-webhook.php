<?php

declare(strict_types=1);

use Iripurtova\Telegram\TelegramApiClient;

/** @var \Iripurtova\Telegram\TelegramConfig $config */
$config = require __DIR__ . '/_bootstrap.php';

$webhook = is_array($config->get('webhook')) ? $config->get('webhook') : [];
$token = (string) $config->get('bot_token', '');
$secret = (string) $config->get('webhook_secret', '');
$dropPendingUpdates = in_array('--drop-pending', $argv, true);

$client = new TelegramApiClient($token);

$result = $client->call('setWebhook', [
    'url' => (string) ($webhook['url'] ?? ''),
    'secret_token' => $secret,
    'max_connections' => (int) ($webhook['max_connections'] ?? 10),
    'allowed_updates' => is_array($webhook['allowed_updates'] ?? null) ? $webhook['allowed_updates'] : ['message', 'callback_query'],
    'drop_pending_updates' => $dropPendingUpdates,
]);

echo "Webhook configured.\n";
echo $dropPendingUpdates ? "Pending updates dropped.\n" : "Pending updates preserved.\n";
echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
