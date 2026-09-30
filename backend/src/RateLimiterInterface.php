<?php

declare(strict_types=1);

namespace Iripurtova\Contact;

interface RateLimiterInterface
{
    public function consume(string $ipAddress): RateLimitDecision;
}
