<?php

declare(strict_types=1);

use Iripurtova\Contact\ContactController;
use Iripurtova\Contact\FileRateLimiter;
use Iripurtova\Contact\RequestValidator;
use Iripurtova\Contact\SmtpMailer;

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

$runtimeRoot = is_file(__DIR__ . '/vendor/autoload.php') ? __DIR__ : dirname(__DIR__);
$autoloadPath = $runtimeRoot . '/vendor/autoload.php';
$documentRoot = isset($_SERVER['DOCUMENT_ROOT']) ? rtrim((string) $_SERVER['DOCUMENT_ROOT'], DIRECTORY_SEPARATOR) : '';
$configPath = $documentRoot === '' ? '' : dirname($documentRoot) . '/private/contact-config.php';

if (!is_file($autoloadPath) || $configPath === '' || !is_file($configPath)) {
    $requestId = bin2hex(random_bytes(8));
    error_log(sprintf('[contact][%s] runtime_configuration_missing', $requestId));
    http_response_code(500);
    header('X-Request-ID: ' . $requestId);
    echo json_encode(['ok' => false, 'error' => 'SEND_FAILED']);
    exit;
}

require $autoloadPath;

try {
    $config = require $configPath;
    if (!is_array($config)) {
        throw new RuntimeException('Configuration must return an array.');
    }

    $security = is_array($config['security'] ?? null) ? $config['security'] : [];
    $controller = new ContactController(
        new RequestValidator(),
        new FileRateLimiter(
            (string) ($security['rate_limit_dir'] ?? ''),
            (string) ($security['rate_limit_secret'] ?? ''),
            (int) ($security['rate_limit_max'] ?? 3),
            (int) ($security['rate_limit_window_seconds'] ?? 600),
        ),
        new SmtpMailer(is_array($config['smtp'] ?? null) ? $config['smtp'] : []),
        is_array($config['allowed_origins'] ?? null) ? $config['allowed_origins'] : [],
    );

    $response = $controller->handle($_SERVER, file_get_contents('php://input') ?: '');
    http_response_code($response->status);
    foreach ($response->headers as $name => $value) {
        header($name . ': ' . $value);
    }
    echo json_encode($response->body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
} catch (Throwable $exception) {
    $requestId = bin2hex(random_bytes(8));
    error_log(sprintf('[contact][%s] bootstrap_failed %s:%s', $requestId, $exception::class, $exception->getCode()));
    http_response_code(500);
    header('X-Request-ID: ' . $requestId);
    echo json_encode(['ok' => false, 'error' => 'SEND_FAILED']);
}
