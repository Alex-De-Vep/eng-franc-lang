<?php

declare(strict_types=1);

namespace Iripurtova\Contact;

final class RequestValidator
{
    private const LOCALES = ['ru', 'en', 'fr'];

    /** @param array<string, mixed> $payload */
    public function validate(array $payload): ContactRequest
    {
        $email = is_string($payload['email'] ?? null) ? trim($payload['email']) : '';
        $comment = is_string($payload['comment'] ?? null) ? trim($payload['comment']) : '';
        $locale = is_string($payload['locale'] ?? null) ? strtolower(trim($payload['locale'])) : '';
        $website = is_string($payload['website'] ?? null) ? trim($payload['website']) : '';
        $consent = $payload['consent'] ?? null;
        $errors = [];

        if ($email === '') {
            $errors['email'] = 'required';
        } elseif ($this->length($email) > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            $errors['email'] = 'invalid';
        }

        if ($this->length($comment) > 2000) {
            $errors['comment'] = 'too_long';
        }

        if ($consent !== true) {
            $errors['consent'] = 'required';
        }

        if (!in_array($locale, self::LOCALES, true)) {
            $errors['locale'] = 'invalid';
        }

        if ($errors !== []) {
            throw new ValidationException($errors);
        }

        return new ContactRequest($email, $comment, true, $locale, $website);
    }

    private function length(string $value): int
    {
        return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
    }
}
