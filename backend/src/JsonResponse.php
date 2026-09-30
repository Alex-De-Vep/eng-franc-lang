<?php

declare(strict_types=1);

namespace Iripurtova\Contact;

final readonly class JsonResponse
{
    /** @param array<string, mixed> $body @param array<string, string> $headers */
    public function __construct(
        public int $status,
        public array $body,
        public array $headers = [],
    ) {
    }
}
