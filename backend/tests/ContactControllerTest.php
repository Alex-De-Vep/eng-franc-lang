<?php

declare(strict_types=1);

namespace Iripurtova\Contact\Tests;

use Iripurtova\Contact\ContactController;
use Iripurtova\Contact\ContactRequest;
use Iripurtova\Contact\MailerInterface;
use Iripurtova\Contact\RateLimitDecision;
use Iripurtova\Contact\RateLimiterInterface;
use Iripurtova\Contact\RequestValidator;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use RuntimeException;

final class ContactControllerTest extends TestCase
{
    #[DataProvider('protocolErrorProvider')]
    public function testProtocolErrors(array $serverChanges, int $status, string $code): void
    {
        $mailer = new FakeMailer();
        $controller = $this->controller($mailer);
        $response = $controller->handle(array_replace($this->server(), $serverChanges), $this->body());

        self::assertSame($status, $response->status);
        self::assertSame($code, $response->body['error']);
        self::assertSame(0, $mailer->calls);
    }

    /** @return iterable<string, array{array<string, mixed>, int, string}> */
    public static function protocolErrorProvider(): iterable
    {
        yield 'method' => [['REQUEST_METHOD' => 'GET'], 405, 'METHOD_NOT_ALLOWED'];
        yield 'content type' => [['CONTENT_TYPE' => 'text/plain'], 415, 'UNSUPPORTED_MEDIA_TYPE'];
        yield 'origin' => [['HTTP_ORIGIN' => 'https://evil.example'], 403, 'ORIGIN_NOT_ALLOWED'];
    }

    public function testOversizedAndMalformedBodiesAreValidationErrors(): void
    {
        $controller = $this->controller(new FakeMailer());
        self::assertSame(400, $controller->handle($this->server(), str_repeat('x', 16_385))->status);
        self::assertSame(400, $controller->handle($this->server(), '{')->status);
    }

    public function testHoneypotReturnsSuccessWithoutMailerOrRateLimiter(): void
    {
        $mailer = new FakeMailer();
        $limiter = new FakeRateLimiter();
        $controller = $this->controller($mailer, $limiter);
        $response = $controller->handle($this->server(), json_encode([
            'website' => 'https://spam.example',
        ], JSON_THROW_ON_ERROR));

        self::assertSame(200, $response->status);
        self::assertTrue($response->body['ok']);
        self::assertSame(0, $mailer->calls);
        self::assertSame(0, $limiter->calls);
    }

    public function testValidRequestUsesRemoteAddrAndMailer(): void
    {
        $mailer = new FakeMailer();
        $limiter = new FakeRateLimiter();
        $controller = $this->controller($mailer, $limiter);
        $server = array_replace($this->server(), [
            'REMOTE_ADDR' => '203.0.113.9',
            'HTTP_X_FORWARDED_FOR' => '198.51.100.1',
        ]);
        $response = $controller->handle($server, $this->body());

        self::assertSame(200, $response->status);
        self::assertSame('203.0.113.9', $limiter->lastIp);
        self::assertSame(1, $mailer->calls);
    }

    public function testRateLimitReturnsRetryAfter(): void
    {
        $limiter = new FakeRateLimiter(new RateLimitDecision(false, 321));
        $response = $this->controller(new FakeMailer(), $limiter)->handle($this->server(), $this->body());

        self::assertSame(429, $response->status);
        self::assertSame('RATE_LIMITED', $response->body['error']);
        self::assertSame('321', $response->headers['Retry-After']);
    }

    public function testMailerExceptionBecomesSafeSendFailedResponse(): void
    {
        $mailer = new FakeMailer(true);
        $logs = [];
        $controller = new ContactController(
            new RequestValidator(),
            new FakeRateLimiter(),
            $mailer,
            ['https://iripurtova-languages.com'],
            static function (string $message) use (&$logs): void {
                $logs[] = $message;
            },
        );
        $response = $controller->handle($this->server(), $this->body());

        self::assertSame(500, $response->status);
        self::assertSame('SEND_FAILED', $response->body['error']);
        self::assertStringNotContainsString('student@example.com', json_encode($response->body, JSON_THROW_ON_ERROR));
        self::assertCount(1, $logs);
        self::assertStringContainsString('password=[redacted]', $logs[0]);
        self::assertStringNotContainsString('must-never-be-returned', $logs[0]);
    }

    private function controller(FakeMailer $mailer, ?FakeRateLimiter $limiter = null): ContactController
    {
        return new ContactController(
            new RequestValidator(),
            $limiter ?? new FakeRateLimiter(),
            $mailer,
            ['https://iripurtova-languages.com'],
            static fn (string $message): null => null,
        );
    }

    /** @return array<string, mixed> */
    private function server(): array
    {
        return [
            'REQUEST_METHOD' => 'POST',
            'CONTENT_TYPE' => 'application/json; charset=UTF-8',
            'HTTP_ORIGIN' => 'https://iripurtova-languages.com',
            'REMOTE_ADDR' => '127.0.0.1',
        ];
    }

    private function body(): string
    {
        return json_encode([
            'email' => 'student@example.com',
            'comment' => 'Evening lessons',
            'consent' => true,
            'locale' => 'en',
            'website' => '',
        ], JSON_THROW_ON_ERROR);
    }
}

final class FakeMailer implements MailerInterface
{
    public int $calls = 0;

    public function __construct(private readonly bool $shouldThrow = false)
    {
    }

    public function send(ContactRequest $request, string $requestId): void
    {
        ++$this->calls;
        if ($this->shouldThrow) {
            throw new RuntimeException('SMTP password=must-never-be-returned');
        }
    }
}

final class FakeRateLimiter implements RateLimiterInterface
{
    public int $calls = 0;
    public ?string $lastIp = null;

    public function __construct(private readonly ?RateLimitDecision $decision = null)
    {
    }

    public function consume(string $ipAddress): RateLimitDecision
    {
        ++$this->calls;
        $this->lastIp = $ipAddress;

        return $this->decision ?? new RateLimitDecision(true);
    }
}
