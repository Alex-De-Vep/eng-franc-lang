<?php

declare(strict_types=1);

namespace Iripurtova\Telegram;

use RuntimeException;

/**
 * Shared helpers for durable, atomic, flock-protected JSON file storage.
 */
final class FileStore
{
    /**
     * Writes a JSON document atomically: write to a temporary file, fsync, then
     * rename over the target. The parent directory is created with 0700.
     */
    public static function writeJson(string $path, array $data): void
    {
        self::ensureDirectory(dirname($path));

        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        $tmp = $path . '.tmp.' . bin2hex(random_bytes(4));

        $handle = @fopen($tmp, 'xb');
        if ($handle === false) {
            throw new RuntimeException('Unable to create temporary file.');
        }

        try {
            if (fwrite($handle, $json) === false) {
                throw new RuntimeException('Unable to write temporary file.');
            }
            fflush($handle);
        } finally {
            fclose($handle);
        }

        if (!@rename($tmp, $path)) {
            @unlink($tmp);
            throw new RuntimeException('Unable to commit file.');
        }

        @chmod($path, 0600);
    }

    /**
     * Executes a callback while holding an exclusive advisory lock on $path.
     * The lock file/parent directory is created on demand.
     *
     * @template T
     * @param callable(): T $callback
     * @return T
     */
    public static function withLock(string $lockPath, callable $callback): mixed
    {
        self::ensureDirectory(dirname($lockPath));

        $handle = @fopen($lockPath, 'c+');
        if ($handle === false) {
            throw new RuntimeException('Unable to open lock file.');
        }

        try {
            if (!flock($handle, LOCK_EX)) {
                throw new RuntimeException('Unable to acquire lock.');
            }

            return $callback();
        } finally {
            flock($handle, LOCK_UN);
            fclose($handle);
        }
    }

    public static function readJson(string $path): ?array
    {
        if (!is_file($path)) {
            return null;
        }

        $raw = @file_get_contents($path);
        if ($raw === false || $raw === '') {
            return null;
        }

        $decoded = json_decode($raw, true, 32, JSON_THROW_ON_ERROR);

        return is_array($decoded) ? $decoded : null;
    }

    public static function ensureDirectory(string $directory): void
    {
        if (is_dir($directory)) {
            return;
        }

        if (!@mkdir($directory, 0700, true) && !is_dir($directory)) {
            throw new RuntimeException('Unable to create directory.');
        }
    }

    public static function remove(string $path): void
    {
        if (is_file($path)) {
            @unlink($path);
        }
    }
}
