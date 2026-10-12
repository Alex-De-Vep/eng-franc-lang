<?php

declare(strict_types=1);

namespace Iripurtova\Telegram;

final readonly class Session
{
    /** @param array<string, mixed> $answers */
    public function __construct(
        public int $userId,
        public int $chatId,
        public string $step,
        public string $locale,
        public string $source,
        public bool $consent,
        public array $answers,
        public int $updatedAt,
    ) {
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
            'chat_id' => $this->chatId,
            'step' => $this->step,
            'locale' => $this->locale,
            'source' => $this->source,
            'consent' => $this->consent,
            'answers' => $this->answers,
            'updated_at' => $this->updatedAt,
        ];
    }

    /** @param array<string, mixed> $data */
    public static function fromArray(array $data): self
    {
        return new self(
            (int) ($data['user_id'] ?? 0),
            (int) ($data['chat_id'] ?? 0),
            (string) ($data['step'] ?? ''),
            (string) ($data['locale'] ?? 'en'),
            (string) ($data['source'] ?? 'direct'),
            (bool) ($data['consent'] ?? false),
            is_array($data['answers'] ?? null) ? $data['answers'] : [],
            (int) ($data['updated_at'] ?? 0),
        );
    }
}
