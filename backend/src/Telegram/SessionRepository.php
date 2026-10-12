<?php

declare(strict_types=1);

namespace Iripurtova\Telegram;

/**
 * Stores and loads in-progress questionnaire sessions, one file per user.
 */
final class SessionRepository
{
    /** @var callable(): int */
    private $clock;

    public function __construct(private readonly string $storageDir, ?callable $clock = null)
    {
        $this->clock = $clock ?? static fn (): int => time();
    }

    private function path(int $userId): string
    {
        return rtrim($this->storageDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'sessions' . DIRECTORY_SEPARATOR . $userId . '.json';
    }

    private function lockPath(int $userId): string
    {
        return rtrim($this->storageDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'locks' . DIRECTORY_SEPARATOR . 'session-' . $userId . '.lock';
    }

    public function find(int $userId): ?Session
    {
        $data = FileStore::readJson($this->path($userId));

        return $data === null ? null : Session::fromArray($data);
    }

    public function save(Session $session): void
    {
        FileStore::withLock($this->lockPath($session->userId), function () use ($session): void {
            FileStore::writeJson($this->path($session->userId), $session->toArray());
        });
    }

    public function delete(int $userId): void
    {
        FileStore::withLock($this->lockPath($userId), function () use ($userId): void {
            FileStore::remove($this->path($userId));
        });
    }

    /** @return list<int> */
    public function staleUserIds(int $olderThanSeconds): array
    {
        $directory = rtrim($this->storageDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'sessions';
        FileStore::ensureDirectory($directory);

        $now = ($this->clock)();
        $threshold = $now - $olderThanSeconds;
        $ids = [];

        foreach (glob($directory . '/*.json') ?: [] as $file) {
            $data = FileStore::readJson($file);
            if ($data === null) {
                continue;
            }
            if ((int) ($data['updated_at'] ?? 0) < $threshold) {
                $ids[] = (int) ($data['user_id'] ?? 0);
            }
        }

        return $ids;
    }
}
