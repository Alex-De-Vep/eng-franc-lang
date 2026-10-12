<?php

declare(strict_types=1);

namespace Iripurtova\Telegram;

use DateTimeImmutable;
use DateTimeZone;

/**
 * Builds the Russian HTML notification sent to the teacher.
 */
final class ApplicationNotifier
{
    public function __construct(private readonly string $timezone = 'Europe/Moscow')
    {
    }

    /** @param array<string, mixed> $answers */
    public function render(Application $application, ?int $contactUserId = null): string
    {
        $answers = $application->answers;
        $language = $this->label((string) ($answers['language'] ?? ''), ['en' => 'Английский', 'fr' => 'Французский']);
        $goal = $this->label((string) ($answers['goal'] ?? ''), [
            'travel' => 'Путешествия',
            'work' => 'Работа',
            'study' => 'Учёба',
            'self' => 'Для себя',
            'other' => 'Другое',
        ]);
        $level = $this->label((string) ($answers['level'] ?? ''), [
            'beginner' => 'Начальный',
            'intermediate' => 'Средний',
            'advanced' => 'Продвинутый',
            'unknown' => 'Не знаю',
        ]);

        $contact = $this->contactHtml($answers, $contactUserId);

        $source = HtmlEscaper::safe((string) ($answers['source'] ?? ''));

        $date = (new DateTimeImmutable('now', new DateTimeZone($this->timezone)))->format('Y-m-d H:i:s');

        $lines = [
            'Новая заявка с урока 🎓',
            'ID: ' . HtmlEscaper::escape($application->applicationId),
            'Язык: ' . $language,
            'Имя: ' . HtmlEscaper::safe((string) ($answers['name'] ?? ''), 120),
            'Возраст: ' . HtmlEscaper::safe((string) ($answers['age'] ?? ''), 3),
            'Город: ' . HtmlEscaper::safe((string) ($answers['city'] ?? ''), 120),
            'Страна: ' . HtmlEscaper::safe((string) ($answers['country'] ?? ''), 120),
            'Цель: ' . $goal,
            'Уровень: ' . $level,
            'Контакт: ' . $contact,
            'Источник: ' . $source,
            'Локаль: ' . HtmlEscaper::safe((string) ($answers['locale'] ?? ''), 16),
            'Дата (МСК): ' . $date,
        ];

        return implode("\n", $lines);
    }

    /** @param array<string, mixed> $answers */
    private function contactHtml(array $answers, ?int $contactUserId): string
    {
        $method = (string) ($answers['contact_method'] ?? '');

        if ($method === 'telegram') {
            $username = (string) ($answers['contact_username'] ?? '');
            if ($username !== '') {
                return '@' . HtmlEscaper::safe(ltrim($username, '@'), 64);
            }

            $userId = $contactUserId ?? (int) ($answers['contact_user_id'] ?? 0);
            if ($userId > 0) {
                return '<a href="tg://user?id=' . $userId . '">' . $userId . '</a>';
            }

            return 'Telegram';
        }

        if ($method === 'phone') {
            return HtmlEscaper::safe((string) ($answers['contact_phone'] ?? ''), 32);
        }

        return '—';
    }

    /** @param array<string, string> $map */
    private function label(string $key, array $map): string
    {
        $label = $map[$key] ?? null;

        return HtmlEscaper::safe($label === null ? ($key === '' ? '—' : $key) : $label, 64);
    }
}
