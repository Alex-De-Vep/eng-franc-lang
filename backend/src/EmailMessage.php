<?php

declare(strict_types=1);

namespace Iripurtova\Contact;

final readonly class EmailMessage
{
    public function __construct(
        public string $subject,
        public string $html,
        public string $text,
    ) {
    }
}
