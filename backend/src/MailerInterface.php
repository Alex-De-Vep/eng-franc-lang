<?php

declare(strict_types=1);

namespace Iripurtova\Contact;

interface MailerInterface
{
    public function send(ContactRequest $request, string $requestId): void;
}
