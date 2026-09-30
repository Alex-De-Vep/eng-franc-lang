<?php

declare(strict_types=1);

return [
    'allowed_origins' => [
        'https://iripurtova-languages.com',
    ],
    'smtp' => [
        'host' => 'smtp.timeweb.ru',
        'port' => 587,
        'username' => 'website@iripurtova-languages.com',
        'password' => 'replace-with-the-timeweb-mailbox-password',
        'from_email' => 'website@iripurtova-languages.com',
        'from_name' => 'Irina Purtova Languages',
        'to_email' => 'teacher@gmail.com',
        'to_name' => 'Irina Purtova',
    ],
    'security' => [
        'rate_limit_secret' => 'replace-with-at-least-32-random-characters',
        'rate_limit_dir' => '/home/example/private/contact-rate-limit',
        'rate_limit_max' => 3,
        'rate_limit_window_seconds' => 600,
    ],
];
