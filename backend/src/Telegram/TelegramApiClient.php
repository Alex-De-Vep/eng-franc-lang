<?php

declare(strict_types=1);

namespace Iripurtova\Telegram;

use RuntimeException;

/**
 * Thin cURL client for the Telegram Bot API.
 *
 * A call returns the decoded "result" on success. Network/transport failures and
 * HTTP 5xx responses throw a TransientApiException (caller may retry later).
 * HTTP 4xx bot-level errors throw an ApiException. Neither exception message
 * contains the token or sensitive values.
 */
final class TelegramApiClient implements ApiClientInterface
{
    private const API_BASE = 'https://api.telegram.org/bot';

    /** @var callable(string): mixed */
    private $logger;

    public function __construct(
        private readonly string $token,
        private readonly int $connectTimeout = 5,
        private readonly int $requestTimeout = 12,
        ?callable $logger = null,
    ) {
        if ($token === '') {
            throw new RuntimeException('Telegram token must not be empty.');
        }
        $this->logger = $logger ?? static fn (string $message): bool => error_log('[telegram] ' . $message);
    }

    /** @param array<string, mixed> $payload */
    public function call(string $method, array $payload): mixed
    {
        $url = self::API_BASE . $this->token . '/' . $method;
        $handle = curl_init($url);

        if ($handle === false) {
            throw new TransientApiException('curl_init_failed');
        }

        curl_setopt_array($handle, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_CONNECTTIMEOUT => $this->connectTimeout,
            CURLOPT_TIMEOUT => $this->requestTimeout,
        ]);

        $response = curl_exec($handle);
        $errno = curl_errno($handle);
        $httpCode = (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
        // Never log the URL (it contains the token), payload or raw cURL error.
        ($this->logger)(sprintf(
            'api_call method=%s http=%d curl_errno=%d dns_ms=%d connect_ms=%d tls_ms=%d first_byte_ms=%d total_ms=%d',
            preg_replace('/[^a-zA-Z0-9_]/', '', $method),
            $httpCode,
            $errno,
            (int) round((float) curl_getinfo($handle, CURLINFO_NAMELOOKUP_TIME) * 1000),
            (int) round((float) curl_getinfo($handle, CURLINFO_CONNECT_TIME) * 1000),
            (int) round((float) curl_getinfo($handle, CURLINFO_APPCONNECT_TIME) * 1000),
            (int) round((float) curl_getinfo($handle, CURLINFO_STARTTRANSFER_TIME) * 1000),
            (int) round((float) curl_getinfo($handle, CURLINFO_TOTAL_TIME) * 1000),
        ));
        curl_close($handle);

        if ($response === false || $errno !== 0) {
            throw new TransientApiException('network_error');
        }

        return $this->interpret($response, $httpCode);
    }

    private function interpret(string $raw, int $httpCode): mixed
    {
        if ($httpCode >= 500) {
            throw new TransientApiException('telegram_unavailable');
        }

        if ($httpCode >= 400 && $httpCode < 500) {
            throw new ApiException('telegram_bad_request');
        }

        $decoded = json_decode($raw, true, 32, JSON_THROW_ON_ERROR);

        if (!is_array($decoded)) {
            throw new TransientApiException('invalid_response');
        }

        if (($decoded['ok'] ?? false) === true) {
            return $decoded['result'] ?? null;
        }

        $description = (string) ($decoded['description'] ?? 'unspecified');

        // 429 Too Many Requests is a transient backoff condition.
        if ($decoded['error_code'] === 429) {
            throw new TransientApiException('rate_limited');
        }

        throw new ApiException('telegram_error:' . substr($description, 0, 64));
    }
}
