<?php

declare(strict_types=1);

use Iripurtova\Telegram\ApplicationRepository;
use Iripurtova\Telegram\SessionRepository;
use Iripurtova\Telegram\UpdateDeduplicator;

/**
 * Cron: removes stale sessions, processed-update markers and delivered
 * tombstones. Run once a day. Pending applications are never deleted here.
 */

/** @var \Iripurtova\Telegram\TelegramConfig $config */
$config = require __DIR__ . '/_bootstrap.php';

$storage = (string) $config->get('storage_dir', '');
$retention = is_array($config->get('retention')) ? $config->get('retention') : [];

$sessions = new SessionRepository($storage);
$deduplicator = new UpdateDeduplicator($storage);
$applications = new ApplicationRepository($storage);

$sessionRemoved = 0;
foreach ($sessions->staleUserIds((int) ($retention['session'] ?? 604800)) as $userId) {
    $sessions->delete($userId);
    ++$sessionRemoved;
}

$updatesRemoved = 0;
foreach ($deduplicator->staleIds((int) ($retention['update_marker'] ?? 172800)) as $updateId) {
    $deduplicator->delete($updateId);
    ++$updatesRemoved;
}

$deliveredRemoved = 0;
foreach ($applications->deliveredIdsOlderThan((int) ($retention['delivered'] ?? 604800)) as $applicationId) {
    $applications->delete($applicationId, 'delivered');
    ++$deliveredRemoved;
}

echo sprintf(
    "cleanup: sessions=%d updates=%d delivered=%d\n",
    $sessionRemoved,
    $updatesRemoved,
    $deliveredRemoved,
);
