<?php

declare(strict_types=1);

namespace Iripurtova\Contact;

use PHPMailer\PHPMailer\PHPMailer;

final class SmtpMailer implements MailerInterface
{
    private readonly EmailTemplate $template;

    /** @param array<string, mixed> $config */
    public function __construct(private readonly array $config, ?EmailTemplate $template = null)
    {
        $this->template = $template ?? new EmailTemplate();
    }

    public function send(ContactRequest $request, string $requestId): void
    {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = (string) $this->config['host'];
        $mail->Port = (int) $this->config['port'];
        $mail->SMTPAuth = true;
        $mail->Username = (string) $this->config['username'];
        $mail->Password = (string) $this->config['password'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->CharSet = PHPMailer::CHARSET_UTF8;
        $mail->Timeout = 12;
        $mail->setFrom((string) $this->config['from_email'], (string) $this->config['from_name']);
        $mail->addAddress((string) $this->config['to_email'], (string) $this->config['to_name']);
        $mail->addReplyTo($request->email);

        $message = $this->template->render($request, $requestId);
        $mail->Subject = $message->subject;
        $mail->isHTML(true);
        $mail->Body = $message->html;
        $mail->AltBody = $message->text;
        $mail->send();
    }
}
