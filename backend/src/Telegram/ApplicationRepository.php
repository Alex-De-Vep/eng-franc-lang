<?php

declare(strict_types=1);

namespace Iripurtova\Telegram;

/**
 * Stores ready applications in pending/ and delivered/ keyed by a stable
 * hex application id.
 */
final class ApplicationRepository
{
    /** @var callable(): int */
    private $clock;

    public function __construct(private readonly string $storageDir, ?callable $clock = null)
    {
        $this->clock = $clock ?? static fn (): int => time();
    }

    private function path(string $applicationId, string $status): string
    {
        return rtrim($this->storageDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $status . DIRECTORY_SEPARATOR . $applicationId . '.json';
    }

    private function lockPath(string $applicationId): string
    {
        return rtrim($this->storageDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'locks' . DIRECTORY_SEPARATOR . 'application-' . $applicationId . '.lock';
    }

    public function save(Application $application): void
    {
        FileStore::withLock($this->lockPath($application->applicationId), function () use ($application): void {
            if ($application->status === 'pending') {
                FileStore::remove($this->path($application->applicationId, 'delivered'));
            }
            FileStore::writeJson($this->path($application->applicationId, $application->status), $application->toArray());
        });
    }

    public function find(string $applicationId): ?Application
    {
        foreach (['pending', 'delivered'] as $status) {
            $data = FileStore::readJson($this->path($applicationId, $status));
            if ($data !== null) {
                return Application::fromArray($data);
            }
        }

        return null;
    }

    /** @return list<Application> */
    public function pendingReady(): array
    {
        $directory = rtrim($this->storageDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'pending';
        FileStore::ensureDirectory($directory);
        $now = ($this->clock)();
        $result = [];

        foreach (glob($directory . '/*.json') ?: [] as $file) {
            $data = FileStore::readJson($file);
            if ($data === null) {
                continue;
            }
            $application = Application::fromArray($data);
            if ($application->status === 'pending' && $application->nextAttemptAt <= $now) {
                $result[] = $application;
            }
        }

        usort($result, static fn (Application $a, Application $b): int => $a->nextAttemptAt <=> $b->nextAttemptAt);

        return $result;
    }

    public function markDelivered(string $applicationId): void
    {
        FileStore::withLock($this->lockPath($applicationId), function () use ($applicationId): void {
            $application = $this->find($applicationId);
            if ($application === null) {
                return;
            }

            $moved = new Application(
                $application->applicationId,
                $application->userId,
                $application->chatId,
                $application->answers,
                'delivered',
                $application->attempts,
                $application->nextAttemptAt,
                $application->lastError,
                $application->createdAt,
            );

            FileStore::remove($this->path($applicationId, 'pending'));
            FileStore::writeJson($this->path($applicationId, 'delivered'), $moved->toArray());
        });
    }

    /** @return list<string> */
    public function deliveredIdsOlderThan(int $olderThanSeconds): array
    {
        $directory = rtrim($this->storageDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'delivered';
        FileStore::ensureDirectory($directory);
        $now = ($this->clock)();
        $threshold = $now - $olderThanSeconds;
        $ids = [];

        foreach (glob($directory . '/*.json') ?: [] as $file) {
            $data = FileStore::readJson($file);
            if ($data === null) {
                continue;
            }
            if ((int) ($data['created_at'] ?? 0) < $threshold) {
                $ids[] = (string) ($data['application_id'] ?? '');
            }
        }

        return $ids;
    }

    public function delete(string $applicationId, string $status): void
    {
        FileStore::remove($this->path($applicationId, $status));
    }
}
