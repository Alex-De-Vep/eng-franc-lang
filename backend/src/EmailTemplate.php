<?php

declare(strict_types=1);

namespace Iripurtova\Contact;

use DateTimeImmutable;
use DateTimeZone;

final class EmailTemplate
{
    private const LOCALE_NAMES = [
        'ru' => 'Русский',
        'en' => 'English',
        'fr' => 'Français',
    ];

    public function render(ContactRequest $request, string $requestId, ?DateTimeImmutable $submittedAt = null): EmailMessage
    {
        $submittedAt ??= new DateTimeImmutable('now', new DateTimeZone('UTC'));
        $submittedAt = $submittedAt->setTimezone(new DateTimeZone('Europe/Moscow'));
        $formattedTime = $submittedAt->format('d.m.Y, H:i') . ' MSK';
        $localeCode = strtoupper($request->locale);
        $localeName = self::LOCALE_NAMES[$request->locale] ?? $localeCode;
        $comment = $request->comment === '' ? 'Комментарий не указан' : $request->comment;
        $subject = sprintf('У вас новая заявка на пробный урок — %s', $localeCode);

        $emailHtml = $this->escape($request->email);
        $commentHtml = nl2br($this->escape($comment));
        $localeHtml = $this->escape($localeName);
        $timeHtml = $this->escape($formattedTime);
        $requestIdHtml = $this->escape($requestId);
        $mailto = $this->escape('mailto:' . $request->email);

        $html = <<<HTML
<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{$this->escape($subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f2efe8;color:#30261f;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#f2efe8;">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:#fffdf9;border:1px solid #e4dccd;border-radius:20px;overflow:hidden;">
          <tr>
            <td style="padding:28px 34px 24px;background-color:#73794a;color:#ffffff;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td valign="middle" style="font-family:Georgia,'Times New Roman',serif;font-size:23px;line-height:28px;letter-spacing:.4px;">
                    Irina Purtova
                    <div style="margin-top:3px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:15px;letter-spacing:2px;text-transform:uppercase;color:#f3e6c7;">Languages</div>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display:inline-block;padding:7px 11px;border:1px solid rgba(255,255,255,.45);border-radius:999px;font-size:11px;line-height:14px;font-weight:700;letter-spacing:1px;color:#ffffff;">{$localeCode}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:34px 34px 10px;">
              <div style="margin-bottom:10px;font-size:11px;line-height:15px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#9b7a32;">У вас новая заявка</div>
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:40px;font-weight:400;color:#30261f;">Запись на пробный урок</h1>
              <p style="margin:13px 0 0;font-size:15px;line-height:23px;color:#6d6259;">Посетитель сайта оставил контактные данные. Ответить можно прямо на это письмо или по кнопке ниже.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 34px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#f7f3ea;border:1px solid #e5dbc8;border-radius:14px;">
                <tr>
                  <td style="padding:19px 20px;">
                    <div style="margin-bottom:7px;font-size:11px;line-height:14px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;color:#8a795e;">Email ученика</div>
                    <a href="{$mailto}" style="font-size:18px;line-height:25px;font-weight:700;color:#62683f;text-decoration:none;word-break:break-word;">{$emailHtml}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 34px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#ffffff;border:1px solid #e5dbc8;border-radius:14px;">
                <tr>
                  <td style="padding:19px 20px;">
                    <div style="margin-bottom:8px;font-size:11px;line-height:14px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;color:#8a795e;">Комментарий</div>
                    <div style="font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:27px;color:#30261f;word-break:break-word;">{$commentHtml}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 34px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="50%" valign="top" style="padding:0 8px 13px 0;">
                    <div style="font-size:11px;line-height:14px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#9b8f82;">Язык страницы</div>
                    <div style="margin-top:5px;font-size:14px;line-height:20px;color:#4b4139;">{$localeHtml}</div>
                  </td>
                  <td width="50%" valign="top" style="padding:0 0 13px 8px;">
                    <div style="font-size:11px;line-height:14px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#9b8f82;">Время заявки</div>
                    <div style="margin-top:5px;font-size:14px;line-height:20px;color:#4b4139;">{$timeHtml}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:9px 34px 31px;">
              <a href="{$mailto}" style="display:inline-block;box-sizing:border-box;min-width:230px;padding:14px 24px;background-color:#73794a;border-radius:12px;color:#ffffff;font-size:15px;line-height:20px;font-weight:700;text-align:center;text-decoration:none;">Ответить ученику</a>
            </td>
          </tr>
          <tr>
            <td style="padding:17px 34px;background-color:#f7f3ea;border-top:1px solid #e5dbc8;font-size:11px;line-height:17px;color:#8d8277;text-align:center;">
              Заявка с сайта iripurtova-languages.com · ID {$requestIdHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;

        $text = implode("\n", [
            'НОВАЯ ЗАЯВКА НА ПРОБНЫЙ УРОК',
            '',
            'Email ученика: ' . $request->email,
            'Комментарий: ' . $comment,
            'Язык страницы: ' . $localeName,
            'Время заявки: ' . $formattedTime,
            'Request ID: ' . $requestId,
            '',
            'Ответьте на это письмо, чтобы связаться с учеником.',
        ]);

        return new EmailMessage($subject, $html, $text);
    }

    private function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
}
