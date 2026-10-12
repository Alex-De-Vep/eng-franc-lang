<?php

declare(strict_types=1);

namespace Iripurtova\Telegram;

interface ApiClientInterface
{
    /** @param array<string, mixed> $payload */
    public function call(string $method, array $payload): mixed;
}
