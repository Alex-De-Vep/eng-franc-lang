<?php

declare(strict_types=1);

namespace Iripurtova\Telegram;

use RuntimeException;

final class UpdateValidator
{
    /** @param array<string, mixed> $update */
    public function normalize(array $update): ?Update
    {
        $updateId = $update['update_id'] ?? null;
        if (!is_int($updateId) && !(is_string($updateId) && ctype_digit($updateId))) {
            throw new RuntimeException('update_id_missing');
        }

        $id = (int) $updateId;

        if (isset($update['message']) && is_array($update['message'])) {
            $message = $update['message'];
            $from = $message['from'] ?? null;
            $chat = $message['chat'] ?? null;

            if (!is_array($from) || !is_array($chat) || ($chat['type'] ?? null) !== 'private') {
                return null;
            }

            $userId = $from['id'] ?? null;
            $chatId = $chat['id'] ?? null;
            if (!is_int($userId) && !(is_string($userId) && ctype_digit($userId))
                || !is_int($chatId) && !(is_string($chatId) && ctype_digit($chatId))) {
                return null;
            }

            return new Update(
                $id,
                'message',
                (int) $userId,
                (int) $chatId,
                is_string($message['text'] ?? null) ? $message['text'] : null,
                null,
                is_string($from['language_code'] ?? null) ? $from['language_code'] : null,
                is_string($from['username'] ?? null) ? $from['username'] : null,
                is_array($message['contact'] ?? null) ? $message['contact'] : null,
            );
        }

        if (isset($update['callback_query']) && is_array($update['callback_query'])) {
            $callback = $update['callback_query'];
            $from = $callback['from'] ?? null;
            $message = $callback['message'] ?? null;
            $chat = is_array($message) ? ($message['chat'] ?? null) : null;

            if (!is_array($from) || !is_array($chat) || ($chat['type'] ?? null) !== 'private') {
                return null;
            }

            $userId = $from['id'] ?? null;
            $chatId = $chat['id'] ?? null;
            if (!is_int($userId) && !(is_string($userId) && ctype_digit($userId))
                || !is_int($chatId) && !(is_string($chatId) && ctype_digit($chatId))) {
                return null;
            }

            return new Update(
                $id,
                'callback_query',
                (int) $userId,
                (int) $chatId,
                null,
                is_string($callback['data'] ?? null) ? $callback['data'] : null,
                is_string($from['language_code'] ?? null) ? $from['language_code'] : null,
                is_string($from['username'] ?? null) ? $from['username'] : null,
                null,
                is_string($callback['id'] ?? null) ? $callback['id'] : null,
            );
        }

        return null;
    }
}
