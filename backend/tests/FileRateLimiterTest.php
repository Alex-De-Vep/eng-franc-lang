<?php

declare(strict_types=1);

namespace Iripurtova\Contact\Tests;

use Iripurtova\Contact\FileRateLimiter;
use PHPUnit\Framework\TestCase;

final class FileRateLimiterTest extends TestCase
{
    private string $directory;

    protected function setUp(): void
    {
        $this->directory = sys_get_temp_dir() . '/contact-rate-test-' . bin2hex(random_bytes(6));
    }

    protected function tearDown(): void
    {
        foreach (glob($this->directory . '/*') ?: [] as $file) {
            unlink($file);
        }
        if (is_dir($this->directory)) {
            rmdir($this->directory);
        }
    }

    public function testSharedFileStateLimitsTheFourthRequestAndThenExpires(): void
    {
        $now = 1_000;
        $clock = static function () use (&$now): int {
            return $now;
        };
        $firstProcess = new FileRateLimiter($this->directory, 'test-secret', 3, 600, $clock);
        $secondProcess = new FileRateLimiter($this->directory, 'test-secret', 3, 600, $clock);

        self::assertTrue($firstProcess->consume('203.0.113.10')->allowed);
        self::assertTrue($secondProcess->consume('203.0.113.10')->allowed);
        self::assertTrue($firstProcess->consume('203.0.113.10')->allowed);

        $blocked = $secondProcess->consume('203.0.113.10');
        self::assertFalse($blocked->allowed);
        self::assertSame(600, $blocked->retryAfter);

        $now = 1_601;
        self::assertTrue($firstProcess->consume('203.0.113.10')->allowed);
    }

    public function testIpAddressIsStoredOnlyAsHmacFilename(): void
    {
        $limiter = new FileRateLimiter($this->directory, 'test-secret');
        $limiter->consume('198.51.100.42');
        $files = glob($this->directory . '/*.json') ?: [];

        self::assertCount(1, $files);
        self::assertStringNotContainsString('198.51.100.42', basename($files[0]));
        self::assertSame(hash_hmac('sha256', '198.51.100.42', 'test-secret') . '.json', basename($files[0]));
    }
}
