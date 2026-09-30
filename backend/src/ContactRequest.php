<?php

declare(strict_types=1);

namespace Iripurtova\Contact;

final readonly class ContactRequest
{
    public function __construct(
        public string $email,
        public string $comment,
        public bool $consent,
        public string $locale,
        public string $website,
    ) {
    }
}
