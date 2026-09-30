<?php

declare(strict_types=1);

namespace Iripurtova\Contact;

use JsonException;
use Throwable;

final class ContactController
{
    /** @var callable(string): mixed */
    private $logger;

    /** @param list<string> $allowedOrigins */
    public function __construct(
        private readonly RequestValidator $validator,
        private readonly RateLimiterInterface $rateLimiter,
        private readonly MailerInterface $mailer,
        private readonly array $allowedOrigins,
        ?callable $logger = null,
    ) {
        $this->logger = $logger ?? static fn (string $message): bool => error_log($message);
    }

    /** @param array<string, mixed> $server */
    public function handle(array $server, string $rawBody): JsonResponse
    {
        $requestId = bin2hex(random_bytes(8));

        if (strtoupper((string) ($server['REQUEST_METHOD'] ?? '')) !== 'POST') {
            return $this->error(405, 'METHOD_NOT_ALLOWED', $requestId, ['Allow' => 'POST']);
        }

        $contentType = strtolower(trim(explode(';', (string) ($server['CONTENT_TYPE'] ?? ''))[0]));
        if ($contentType !== 'application/json') {
            return $this->error(415, 'UNSUPPORTED_MEDIA_TYPE', $requestId);
        }

        $origin = (string) ($server['HTTP_ORIGIN'] ?? '');
        if (!in_array($origin, $this->allowedOrigins, true)) {
            return $this->error(403, 'ORIGIN_NOT_ALLOWED', $requestId);
        }

        $declaredLength = (int) ($server['CONTENT_LENGTH'] ?? 0);
        if ($declaredLength > 16_384 || strlen($rawBody) > 16_384) {
            return $this->validationError(['request' => 'too_large'], $requestId);
        }

        try {
            $payload = json_decode($rawBody, true, 16, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            return $this->validationError(['request' => 'invalid_json'], $requestId);
        }

        if (!is_array($payload)) {
            return $this->validationError(['request' => 'invalid_json'], $requestId);
        }

        $website = is_string($payload['website'] ?? null) ? trim($payload['website']) : '';
        if ($website !== '') {
            return $this->success($requestId);
        }

        try {
            $request = $this->validator->validate($payload);
        } catch (ValidationException $exception) {
            return $this->validationError($exception->fields, $requestId);
        }

        try {
            $decision = $this->rateLimiter->consume((string) ($server['REMOTE_ADDR'] ?? 'unknown'));
        } catch (Throwable $exception) {
            ($this->logger)(sprintf('[contact][%s] rate_limiter_failed %s:%s', $requestId, $exception::class, $exception->getCode()));
            return $this->error(500, 'SEND_FAILED', $requestId);
        }

        if (!$decision->allowed) {
            return $this->error(429, 'RATE_LIMITED', $requestId, [
                'Retry-After' => (string) $decision->retryAfter,
            ]);
        }

        try {
            $this->mailer->send($request, $requestId);
        } catch (Throwable $exception) {
            ($this->logger)(sprintf(
                '[contact][%s] send_failed %s:%s %s',
                $requestId,
                $exception::class,
                $exception->getCode(),
                $this->safeTechnicalReason($exception),
            ));
            return $this->error(500, 'SEND_FAILED', $requestId);
        }

        return $this->success($requestId);
    }

    private function success(string $requestId): JsonResponse
    {
        return new JsonResponse(200, ['ok' => true], ['X-Request-ID' => $requestId]);
    }

    /** @param array<string, string> $fields */
    private function validationError(array $fields, string $requestId): JsonResponse
    {
        return new JsonResponse(400, [
            'ok' => false,
            'error' => 'VALIDATION_ERROR',
            'fields' => $fields,
        ], ['X-Request-ID' => $requestId]);
    }

    /** @param array<string, string> $headers */
    private function error(int $status, string $code, string $requestId, array $headers = []): JsonResponse
    {
        return new JsonResponse($status, [
            'ok' => false,
            'error' => $code,
        ], ['X-Request-ID' => $requestId, ...$headers]);
    }

    private function safeTechnicalReason(Throwable $exception): string
    {
        $message = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $exception->getMessage()) ?? '';
        $message = preg_replace('/[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/iu', '[email]', $message) ?? '';
        $message = preg_replace('/\b(password|passwd|pass|token|secret)\s*[=:]\s*\S+/iu', '$1=[redacted]', $message) ?? '';
        $message = trim($message);

        return $message === '' ? 'no_diagnostic_message' : substr($message, 0, 500);
    }
}
