<?php

declare(strict_types=1);

namespace Iripurtova\Telegram;

/**
 * Tracks processed update ids so a redelivered webhook update is skipped.
 */
final class UpdateDeduplicator
{
    public function __construct(private readonly string $storageDir)
    {
    }

    private function path(int $updateId): string
    {
        return rtrim($this->storageDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'processed-updates' . DIRECTORY_SEPARATOR . $updateId . '.json';
    }

    public function alreadyProcessed(int $updateId): bool
    {
        return is_file($this->path($updateId));
    }

    public function markProcessed(int $updateId): void
    {
        FileStore::writeJson($this->path($updateId), ['update_id' => $updateId, 'processed_at' => time()]);
    }

    /** @return list<int> */
    public function staleIds(int $olderThanSeconds): array
    {
        $directory = rtrim($this->storageDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'processed-updates';
        FileStore::ensureDirectory($directory);
        $now = time();
        $threshold = $now - $olderThanSeconds;
        $ids = [];

        foreach (glob($directory . '/*.json') ?: [] as $file) {
            $data = FileStore::readJson($file);
            if ($data === null) {
                continue;
            }
            if ((int) ($data['processed_at'] ?? 0) < $threshold) {
                $ids[] = (int) ($data['update_id'] ?? 0);
            }
        }

        return $ids;
    }

    public function delete(int $updateId): void
    {
        FileStore::remove($this->path($updateId));
    }
}
