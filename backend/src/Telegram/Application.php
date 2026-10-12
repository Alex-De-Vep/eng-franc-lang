<?php

declare(strict_types=1);

namespace Iripurtova\Telegram;

final readonly class Application
{
    /** @param array<string, mixed> $answers */
    public function __construct(
        public string $applicationId,
        public int $userId,
        public int $chatId,
        public array $answers,
        public string $status, // 'pending' | 'delivered'
        public int $attempts,
        public int $nextAttemptAt,
        public ?string $lastError,
        public int $createdAt,
    ) {
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'application_id' => $this->applicationId,
            'user_id' => $this->userId,
            'chat_id' => $this->chatId,
            'answers' => $this->answers,
            'status' => $this->status,
            'attempts' => $this->attempts,
            'next_attempt_at' => $this->nextAttemptAt,
            'last_error' => $this->lastError,
            'created_at' => $this->createdAt,
        ];
    }

    /** @param array<string, mixed> $data */
    public static function fromArray(array $data): self
    {
        return new self(
            (string) ($data['application_id'] ?? ''),
            (int) ($data['user_id'] ?? 0),
            (int) ($data['chat_id'] ?? 0),
            is_array($data['answers'] ?? null) ? $data['answers'] : [],
            (string) ($data['status'] ?? 'pending'),
            (int) ($data['attempts'] ?? 0),
            (int) ($data['next_attempt_at'] ?? 0),
            isset($data['last_error']) ? (string) $data['last_error'] : null,
            (int) ($data['created_at'] ?? 0),
        );
    }
}
