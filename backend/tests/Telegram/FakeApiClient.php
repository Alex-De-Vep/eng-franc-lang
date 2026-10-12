<?php

declare(strict_types=1);

namespace Iripurtova\Telegram\Tests;

use Iripurtova\Telegram\ApiClientInterface;
use Iripurtova\Telegram\ApiException;
use Iripurtova\Telegram\TransientApiException;

final class FakeApiClient implements ApiClientInterface
{
    /** @var list<array{method: string, payload: array<string, mixed>}> */
    public array $calls = [];

    /** @var \Throwable|null */
    public $throwOnMethod = null;

    public ?string $failMethod = null;

    /** Fail sendMessage calls targeting this chat id. */
    public ?int $failSendMessageToChat = null;

    /** @var list<int> which sendMessage (1-based) should fail */
    public array $failSendMessageIndexes = [];

    /** @var array<string, mixed>|null */
    public ?array $result = null;

    private int $sendMessageCount = 0;

    public function call(string $method, array $payload): mixed
    {
        $this->calls[] = ['method' => $method, 'payload' => $payload];

        if ($this->throwOnMethod !== null && $this->throwOnMethod === $method) {
            throw $this->failMethod === 'permanent' ? new ApiException('telegram_bad_request') : new TransientApiException('network_error');
        }

        if ($method === 'sendMessage') {
            ++$this->sendMessageCount;
            if (in_array($this->sendMessageCount, $this->failSendMessageIndexes, true)) {
                throw new TransientApiException('network_error');
            }
            if ($this->failSendMessageToChat !== null && ($payload['chat_id'] ?? null) === $this->failSendMessageToChat) {
                throw new TransientApiException('network_error');
            }
        }

        return $this->result;
    }

    /** @return list<string> */
    public function methodNames(): array
    {
        return array_map(static fn (array $call): string => $call['method'], $this->calls);
    }

    /** @return array<string, mixed>|null */
    public function callWithMethod(string $method): ?array
    {
        foreach ($this->calls as $call) {
            if ($call['method'] === $method) {
                return $call['payload'];
            }
        }

        return null;
    }

    /** @return list<array<string, mixed>> */
    public function payloadsOf(string $method): array
    {
        return array_values(array_map(
            static fn (array $call): array => $call['payload'],
            array_filter($this->calls, static fn (array $call): bool => $call['method'] === $method),
        ));
    }
}
