<?php

declare(strict_types=1);

use Iripurtova\Telegram\TelegramApiClient;

/** @var \Iripurtova\Telegram\TelegramConfig $config */
$config = require __DIR__ . '/_bootstrap.php';

$client = new TelegramApiClient((string) $config->get('bot_token', ''));

$teacherChatId = (int) $config->get('teacher_chat_id', 0);
if ($teacherChatId <= 0) {
    fwrite(STDERR, "teacher_chat_id is not configured.\n");
    exit(1);
}

$result = $client->call('sendMessage', [
    'chat_id' => $teacherChatId,
    'text' => '✅ Тестовая отправка от бота: связь настроена.',
]);

echo "Test message sent.\n";
echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n";
