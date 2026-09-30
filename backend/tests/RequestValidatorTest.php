<?php

declare(strict_types=1);

namespace Iripurtova\Contact\Tests;

use Iripurtova\Contact\RequestValidator;
use Iripurtova\Contact\ValidationException;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class RequestValidatorTest extends TestCase
{
    private RequestValidator $validator;

    protected function setUp(): void
    {
        $this->validator = new RequestValidator();
    }

    public function testValidPayloadIsNormalized(): void
    {
        $request = $this->validator->validate([
            'email' => ' student@example.com ',
            'comment' => ' Evening lessons ',
            'consent' => true,
            'locale' => 'RU',
            'website' => '',
        ]);

        self::assertSame('student@example.com', $request->email);
        self::assertSame('Evening lessons', $request->comment);
        self::assertSame('ru', $request->locale);
    }

    /** @param array<string, mixed> $changes */
    #[DataProvider('invalidPayloadProvider')]
    public function testInvalidFieldsAreRejected(array $changes, string $expectedField): void
    {
        $payload = array_replace($this->validPayload(), $changes);

        try {
            $this->validator->validate($payload);
            self::fail('ValidationException was not thrown.');
        } catch (ValidationException $exception) {
            self::assertArrayHasKey($expectedField, $exception->fields);
        }
    }

    /** @return iterable<string, array{array<string, mixed>, string}> */
    public static function invalidPayloadProvider(): iterable
    {
        yield 'missing email' => [['email' => ''], 'email'];
        yield 'bad email' => [['email' => 'not-an-email'], 'email'];
        yield 'email header injection' => [['email' => "student@example.com\r\nBcc: attacker@example.com"], 'email'];
        yield 'missing consent' => [['consent' => false], 'consent'];
        yield 'bad locale' => [['locale' => 'de'], 'locale'];
        yield 'long comment' => [['comment' => str_repeat('x', 2001)], 'comment'];
    }

    /** @return array<string, mixed> */
    private function validPayload(): array
    {
        return [
            'email' => 'student@example.com',
            'comment' => '',
            'consent' => true,
            'locale' => 'ru',
            'website' => '',
        ];
    }
}
