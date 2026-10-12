<?php

declare(strict_types=1);

namespace Iripurtova\Telegram;

use RuntimeException;

final class TelegramConfig
{
    /** @param array<string, mixed> $values */
    private function __construct(private readonly array $values)
    {
    }

    public static function fromArray(array $values, string $documentRoot = ''): self
    {
        $defaults = [
            'bot_username' => 'PurtovaLanguagesBot',
            'privacy_url' => null,
            'timezone' => 'Europe/Moscow',
            'webhook' => [
                'url' => '',
                'max_connections' => 10,
                'allowed_updates' => ['message', 'callback_query'],
            ],
            'rate_limit' => [
                'events_per_minute' => 30,
                'applications_per_day' => 3,
                'rate_limit_secret' => '',
            ],
            'timeouts' => [
                'connect' => 5,
                'request' => 12,
            ],
            'retention' => [
                'session' => 604800,
                'update_marker' => 172800,
                'delivered' => 604800,
            ],
            'retry_intervals' => [300, 900, 3600, 21600, 86400],
        ];

        $merged = array_replace_recursive($defaults, $values);

        if ($documentRoot !== '') {
            $merged['storage_dir'] = dirname($documentRoot) . '/private/telegram-bot';
        }

        $token = (string) ($merged['bot_token'] ?? '');
        if ($token === '') {
            throw new RuntimeException('Missing bot_token.');
        }

        $secret = (string) ($merged['webhook_secret'] ?? '');
        if ($secret === '') {
            throw new RuntimeException('Missing webhook_secret.');
        }

        $chatId = (int) ($merged['teacher_chat_id'] ?? 0);
        if ($chatId <= 0) {
            throw new RuntimeException('Missing teacher_chat_id.');
        }

        $storage = (string) ($merged['storage_dir'] ?? '');
        if ($storage === '') {
            throw new RuntimeException('Missing storage_dir.');
        }

        return new self($merged);
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->values[$key] ?? $default;
    }

    /** @return array<string, mixed> */
    public function all(): array
    {
        return $this->values;
    }
}
