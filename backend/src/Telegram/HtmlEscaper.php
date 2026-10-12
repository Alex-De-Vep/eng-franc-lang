<?php

declare(strict_types=1);

namespace Iripurtova\Telegram;

final class HtmlEscaper
{
    public static function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    /**
     * Escapes a value and truncates it to the given maximum length measured in
     * multibyte characters (uses mb_substr when available).
     */
    public static function safe(string $value, int $maxLength = 256): string
    {
        $clean = trim($value);
        $truncated = self::truncate($clean, $maxLength);

        return self::escape($truncated);
    }

    private static function truncate(string $value, int $maxLength): string
    {
        if ($maxLength < 1) {
            return '';
        }

        if (function_exists('mb_substr')) {
            return mb_substr($value, 0, $maxLength, 'UTF-8');
        }

        return substr($value, 0, $maxLength);
    }
}
