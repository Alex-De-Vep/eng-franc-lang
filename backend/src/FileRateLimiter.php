<?php

declare(strict_types=1);

namespace Iripurtova\Contact;

use RuntimeException;

final class FileRateLimiter implements RateLimiterInterface
{
    /** @var callable(): int */
    private $clock;

    public function __construct(
        private readonly string $directory,
        private readonly string $hmacSecret,
        private readonly int $maxAttempts = 3,
        private readonly int $windowSeconds = 600,
        ?callable $clock = null,
    ) {
        if ($directory === '' || $hmacSecret === '' || $maxAttempts < 1 || $windowSeconds < 1) {
            throw new RuntimeException('Invalid rate limiter configuration.');
        }

        $this->clock = $clock ?? static fn (): int => time();
    }

    public function consume(string $ipAddress): RateLimitDecision
    {
        if (!is_dir($this->directory) && !mkdir($this->directory, 0700, true) && !is_dir($this->directory)) {
            throw new RuntimeException('Unable to create the rate limiter directory.');
        }

        $key = hash_hmac('sha256', $ipAddress, $this->hmacSecret);
        $path = rtrim($this->directory, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $key . '.json';
        $handle = fopen($path, 'c+');

        if ($handle === false) {
            throw new RuntimeException('Unable to open the rate limiter state.');
        }

        try {
            if (!flock($handle, LOCK_EX)) {
                throw new RuntimeException('Unable to lock the rate limiter state.');
            }

            rewind($handle);
            $stored = stream_get_contents($handle);
            $decoded = $stored === false || $stored === '' ? [] : json_decode($stored, true);
            $timestamps = is_array($decoded) ? array_values(array_filter($decoded, 'is_int')) : [];
            $now = ($this->clock)();
            $threshold = $now - $this->windowSeconds;
            $timestamps = array_values(array_filter(
                $timestamps,
                static fn (int $timestamp): bool => $timestamp > $threshold,
            ));

            if (count($timestamps) >= $this->maxAttempts) {
                $retryAfter = max(1, $timestamps[0] + $this->windowSeconds - $now);
                $this->writeState($handle, $timestamps);

                return new RateLimitDecision(false, $retryAfter);
            }

            $timestamps[] = $now;
            $this->writeState($handle, $timestamps);
            @chmod($path, 0600);

            return new RateLimitDecision(true);
        } finally {
            flock($handle, LOCK_UN);
            fclose($handle);
        }
    }

    /** @param resource $handle @param list<int> $timestamps */
    private function writeState($handle, array $timestamps): void
    {
        rewind($handle);
        if (!ftruncate($handle, 0) || fwrite($handle, json_encode($timestamps, JSON_THROW_ON_ERROR)) === false) {
            throw new RuntimeException('Unable to persist the rate limiter state.');
        }
        fflush($handle);
    }
}
