<?php

declare(strict_types=1);

use Iripurtova\Telegram\TelegramConfig;
use Iripurtova\Telegram\TelegramApiClient;

/**
 * Shared CLI bootstrap: loads the closed config and returns a configured API
 * client. The token never leaves this process and is never printed.
 */

$root = dirname(__DIR__);
$autoload = $root . '/vendor/autoload.php';

if (!is_file($autoload)) {
    fwrite(STDERR, "Run `composer install` first.\n");
    exit(1);
}

require $autoload;

if ($argc < 2) {
    fwrite(STDERR, "Usage: php scripts/<script>.php <absolute-path-to-telegram-config.php>\n");
    exit(1);
}

$configPath = $argv[1];
if (!is_file($configPath)) {
    fwrite(STDERR, "Config file not found: $configPath\n");
    exit(1);
}

/** @var array<string, mixed> $values */
$values = require $configPath;
$config = TelegramConfig::fromArray($values);

return $config;
