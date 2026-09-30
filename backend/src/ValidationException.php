<?php

declare(strict_types=1);

namespace Iripurtova\Contact;

use RuntimeException;

final class ValidationException extends RuntimeException
{
    /** @param array<string, string> $fields */
    public function __construct(public readonly array $fields)
    {
        parent::__construct('The request contains invalid fields.');
    }
}
