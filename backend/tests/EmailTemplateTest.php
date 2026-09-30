<?php

declare(strict_types=1);

namespace Iripurtova\Contact\Tests;

use DateTimeImmutable;
use DateTimeZone;
use Iripurtova\Contact\ContactRequest;
use Iripurtova\Contact\EmailTemplate;
use PHPUnit\Framework\TestCase;

final class EmailTemplateTest extends TestCase
{
    public function testRendersBrandedHtmlAndPlainText(): void
    {
        $message = (new EmailTemplate())->render(
            new ContactRequest('student@example.com', "Вечером\nпосле 19:00", true, 'ru', ''),
            'request-123',
            new DateTimeImmutable('2026-09-25 21:31:46', new DateTimeZone('UTC')),
        );

        self::assertSame('У вас новая заявка на пробный урок — RU', $message->subject);
        self::assertStringContainsString('Irina Purtova', $message->html);
        self::assertStringContainsString('Ответить ученику', $message->html);
        self::assertStringContainsString('mailto:student@example.com', $message->html);
        self::assertStringContainsString('26.09.2026, 00:31 MSK', $message->html);
        self::assertStringContainsString('Вечером', $message->text);
        self::assertStringContainsString('request-123', $message->text);
    }

    public function testEscapesUserContentInHtml(): void
    {
        $message = (new EmailTemplate())->render(
            new ContactRequest('student@example.com', '<script>alert("x")</script>', true, 'en', ''),
            '<unsafe-id>',
        );

        self::assertStringNotContainsString('<script>', $message->html);
        self::assertStringContainsString('&lt;script&gt;', $message->html);
        self::assertStringContainsString('&lt;unsafe-id&gt;', $message->html);
        self::assertSame('У вас новая заявка на пробный урок — EN', $message->subject);
    }

    public function testShowsFallbackForEmptyComment(): void
    {
        $message = (new EmailTemplate())->render(
            new ContactRequest('student@example.com', '', true, 'fr', ''),
            'request-456',
        );

        self::assertStringContainsString('Комментарий не указан', $message->html);
        self::assertStringContainsString('Français', $message->html);
    }
}
