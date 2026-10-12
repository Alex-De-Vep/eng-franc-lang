<?php

declare(strict_types=1);

namespace Iripurtova\Telegram;

use RuntimeException;

/**
 * Two independent limits per Telegram user id:
 *  - events within a sliding minute window;
 *  - new applications within a 24 hour window.
 *
 * Filenames are HMAC digests so raw user ids are not exposed on disk.
 */
final class TelegramRateLimiter
{
    /** @var callable(): int */
    private $clock;

    public function __construct(
        private readonly string $storageDir,
        private readonly string $hmacSecret,
        private readonly int $eventsPerMinute = 30,
        private readonly int $applicationsPerDay = 3,
        ?callable $clock = null,
    ) {
        if ($this->hmacSecret === '' || $this->eventsPerMinute < 1 || $this->applicationsPerDay < 1) {
            throw new RuntimeException('Invalid rate limiter configuration.');
        }

        $this->clock = $clock ?? static fn (): int => time();
    }

    public function allowEvent(int $userId): bool
    {
        return $this->consume($userId, 'events', $this->eventsPerMinute, 60);
    }

    public function allowApplication(int $userId): bool
    {
        return $this->consume($userId, 'applications', $this->applicationsPerDay, 86_400);
    }

    private function consume(int $userId, string $bucket, int $max, int $windowSeconds): bool
    {
        $directory = rtrim($this->storageDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'rate-limit';
        FileStore::ensureDirectory($directory);

        $key = hash_hmac('sha256', $bucket . ':' . $userId, $this->hmacSecret);
        $path = $directory . DIRECTORY_SEPARATOR . $key . '.json';

        return FileStore::withLock($directory . DIRECTORY_SEPARATOR . $key . '.lock', function () use ($path, $max, $windowSeconds): bool {
            $decoded = FileStore::readJson($path);
            $timestamps = is_array($decoded) ? array_values(array_filter($decoded, 'is_int')) : [];
            $now = ($this->clock)();
            $threshold = $now - $windowSeconds;
            $timestamps = array_values(array_filter($timestamps, static fn (int $ts): bool => $ts > $threshold));

            if (count($timestamps) >= $max) {
                FileStore::writeJson($path, $timestamps);

                return false;
            }

            $timestamps[] = $now;
            FileStore::writeJson($path, $timestamps);

            return true;
        });
    }
}
