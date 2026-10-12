<?php

declare(strict_types=1);

return [
    // Telegram Bot API token (kept outside the public web root in production).
    'bot_token' => 'replace-with-the-bot-token-from-botfather',

    // Chat ID of the teacher who receives applications. The teacher must press
    // /start in the bot first; the numeric chat ID can be obtained via getUpdates
    // or the provided CLI script once the token is configured.
    'teacher_chat_id' => 0,

    // Public bot username without the leading @ sign.
    'bot_username' => 'PurtovaLanguagesBot',

    // Random secret used to authenticate webhook deliveries. Must be a long
    // random string (at least 32 characters in production) and match the secret
    // configured via setWebhook.
    'webhook_secret' => 'replace-with-at-least-32-random-characters',

    // Optional link to the privacy policy. When null the consent notice is shown
    // without a link; set it without changing any logic.
    'privacy_url' => null,

    // Timezone used for the application date shown to the teacher.
    'timezone' => 'Europe/Moscow',

    // Absolute path to the private storage directory (outside public_html).
    // It must be writable by the PHP user and permission 0700.
    'storage_dir' => '/home/example/private/telegram-bot',

    // Webhook configuration.
    'webhook' => [
        'url' => 'https://iripurtova-languages.com/api/telegram-webhook.php',
        'max_connections' => 10,
        'allowed_updates' => ['message', 'callback_query'],
    ],

    // Rate limiting per Telegram user id.
    'rate_limit' => [
        'events_per_minute' => 30,
        'applications_per_day' => 3,
        'rate_limit_secret' => 'replace-with-at-least-32-random-characters',
    ],

    // Telegram API network timeouts (seconds).
    'timeouts' => [
        'connect' => 5,
        'request' => 12,
    ],

    // Retention (seconds) for cleanup.
    'retention' => [
        'session' => 604800,       // 7 days
        'update_marker' => 172800, // 48 hours
        'delivered' => 604800,     // 7 days
    ],

    // Retry intervals (seconds) for pending applications.
    'retry_intervals' => [300, 900, 3600, 21600, 86400],
];
