<?php

declare(strict_types=1);

namespace Iripurtova\Telegram;

/**
 * Normalized representation of a supported Telegram update: either a private
 * message or a private callback query.
 */
final class Update
{
    public function __construct(
        public readonly int $updateId,
        public readonly string $type, // 'message' | 'callback_query'
        public readonly int $userId,
        public readonly int $chatId,
        public readonly ?string $text,
        public readonly ?string $callbackData,
        public readonly ?string $languageCode,
        public readonly ?string $username,
        public readonly ?array $contact,
        public readonly ?string $callbackQueryId = null,
    ) {
    }
}
