<?php

declare(strict_types=1);

namespace Iripurtova\Contact;

final readonly class RateLimitDecision
{
    public function __construct(
        public bool $allowed,
        public int $retryAfter = 0,
    ) {
    }
}
