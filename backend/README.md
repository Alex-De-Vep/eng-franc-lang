# Contact form backend

PHP 8.2 API для контактных форм и Telegram-бота. Публичные точки входа —
`api/contact.php` (email-форма) и `api/telegram-webhook.php` (бот). Код
приложения находится в `src`, зависимости управляются через Composer.

Реальная конфигурация хранится вне публичного корня. Скопируйте
`config/contact-config.example.php` в:

```text
dirname($_SERVER['DOCUMENT_ROOT'])/private/contact-config.php
```

и `config/telegram-config.example.php` в:

```text
dirname($_SERVER['DOCUMENT_ROOT'])/private/telegram-config.php
```

Эти файлы нельзя добавлять в Git или архив сайта.

## Telegram-бот

Бот `@PurtovaLanguagesBot` ведёт пользователя по анкете на RU/EN/FR через
webhook, хранит состояние в защищённых JSON-файлах вне `public_html` и
отправляет готовую заявку преподавателю. Email-формы и SMTP при этом не
изменяются.

### Конфигурация

В `private/telegram-config.php` заполните:

- `bot_token` — токен от BotFather;
- `teacher_chat_id` — числовой chat id преподавателя;
- `bot_username` — `PurtovaLanguagesBot`;
- `webhook_secret` — случайная строка ≥ 32 символов;
- `privacy_url` — ссылка на политику (опционально, `null` отключает ссылку);
- `timezone` — `Europe/Moscow`;
- `storage_dir` — абсолютный путь к `private/telegram-bot/`;
- лимиты (`rate_limit`), таймауты (`timeouts`) и интервалы повторов
  (`retry_intervals`).

### Получение chat id преподавателя

Преподаватель должен один раз нажать `/start` в боте. Числовой `id` можно
увидеть:

Через `getUpdates` до установки webhook либо у бота, показывающего ID
текущего пользователя. `bot-info.php` выводит ID самого бота и состояние
webhook, но не ID преподавателя. `getUpdates` не работает, пока установлен
webhook; отключать работающий webhook ради получения ID не нужно.

### Структура хранилища

```text
private/telegram-bot/
├── sessions/              # статус анкеты на пользователя
├── pending/               # готовые, ещё не доставленные заявки
├── delivered/             # доставленные (tombstone)
├── processed-updates/     # дедупликация по update_id
├── rate-limit/            # лимиты
└── locks/                 # flock-файлы
```

Права: `0700` на каталог, `0600` на файлы. Каталог принадлежит пользователю PHP.

### Webhook и CLI

```bash
# установить webhook (URL, allowed_updates, max_connections, secret)
php scripts/setup-webhook.php /home/user/private/telegram-config.php

# однократно удалить устаревшую тестовую очередь после диагностики
# (не использовать в обычной работе: удаляет необработанные сообщения)
php scripts/setup-webhook.php /home/user/private/telegram-config.php --drop-pending

# диагностика: getMe + getWebhookInfo
php scripts/bot-info.php /home/user/private/telegram-config.php

# тестовая отправка преподавателю
php scripts/test-send.php /home/user/private/telegram-config.php

# cron: повторная доставка каждые 5 минут
php scripts/retry-delivery.php /home/user/private/telegram-config.php

# cron: очистка один раз в сутки
php scripts/cleanup.php /home/user/private/telegram-config.php
```

Webhook URL: `https://iripurtova-languages.com/api/telegram-webhook.php`,
`allowed_updates` = `message`, `callback_query`, `max_connections` = 10,
secret из конфига. Настройте в Timeweb HTTPS для `.com` и PHP 8.2.

### Ротация токена

При смене токена BotFather:
1. обновите `bot_token` в `private/telegram-config.php`;
2. повторно выполните `scripts/setup-webhook.php`.

### Диагностика

Секреты не выводятся на экран и не пишутся в логи. Для проверки используйте
`bot-info.php` (состояние webhook) и `test-send.php`. Ошибки доставки хранятся
в `pending/*.json` как безопасный код последней ошибки и счётчик попыток.

### Подключение на виртуальном хостинге Timeweb

Для PHP-webhook не нужен постоянно работающий процесс бота. HTTP-запрос
Telegram запускает PHP на сайте. Инструкция Timeweb с Python/PM2 относится
к другому способу размещения на VPS и не применяется к этому проекту.

1. Загрузите содержимое `frontend/timeweb-frontend.zip` в `public_html`.
   Проверьте наличие `api/telegram-webhook.php`, `api/src`, `api/vendor`.
2. В настройках сайта включите PHP 8.2 и действующий HTTPS для `.com`.
   PHP сайта и CLI должны иметь cURL и OpenSSL. URL webhook должен быть
   доступен напрямую, без перенаправлений и браузерной CAPTCHA.
3. Положите конфиг в `private/telegram-config.php`, вне `public_html`.
   Проверьте права записи PHP в `private/telegram-bot` и его подкаталогах.
4. Один раз запустите `setup-webhook.php` с этим конфигом. После результата
   `true` отключите задачу регистрации. Не ставьте её на постоянный cron.
5. Один раз запустите `bot-info.php`: проверьте URL, время последней ошибки
   и количество ожидающих обновлений. Этот скрипт делает только `getMe` и
   `getWebhookInfo`: он не получает и не обрабатывает сообщения пользователей.
6. Отправьте `/start website_en`, запишите время и проверьте свежие записи
   `access_log`/`error_log`. Самостоятельное выполнение CLI не подтверждает,
   что PHP сайта имеет те же настройки и доступ к файлам.

Для аккаунта `cg143414` команды в разделе Crontab → «Произвольный запрос»:

```bash
# Только диагностика; включить для получения свежего лога и затем выключить.
/opt/php82/bin/php /home/c/cg143414/iripurtova-languages/public_html/api/scripts/bot-info.php /home/c/cg143414/iripurtova-languages/private/telegram-config.php >> /home/c/cg143414/iripurtova-languages/private/bot-info.log 2>&1

# Постоянно: каждые 5 минут (минута */5, остальные поля *).
/opt/php82/bin/php /home/c/cg143414/iripurtova-languages/public_html/api/scripts/retry-delivery.php /home/c/cg143414/iripurtova-languages/private/telegram-config.php >> /home/c/cg143414/iripurtova-languages/private/retry-delivery.log 2>&1

# Постоянно: раз в сутки.
/opt/php82/bin/php /home/c/cg143414/iripurtova-languages/public_html/api/scripts/cleanup.php /home/c/cg143414/iripurtova-languages/private/telegram-config.php >> /home/c/cg143414/iripurtova-languages/private/cleanup.log 2>&1
```

Задачи повторной доставки касаются готовых заявок, а не вопросов анкеты.
Диагностика сети добавляет строки `api_call` с кодом HTTP, номером ошибки
cURL и временем DNS, подключения, TLS, первого байта и всего запроса.
Времена в миллисекундах отсчитываются от начала запроса, это не длительности
отдельных этапов. Токен, URL с токеном и содержимое заявки не журналируются.

- `curl_errno=6`: не удалось разрешить DNS; `7`: ошибка подключения;
  `28`: таймаут; `35`/`60`: TLS/сертификат. Эти коды не устанавливают причину
  блокировки или её наличие, но показывают этап сетевого сбоя.
- `[telegram][request-id] received` и `response ... elapsed_ms=...` позволяют
  сопоставить обработку с HTTP-запросом. `api_call` с тем же request ID
  показывает время исходящих обращений именно из PHP сайта.
- `bootstrap_failed stage=... reason=...` показывает безопасный код ошибки
  настройки или файлового хранилища. `duplicate_update`/`stale_callback`
  объясняют успешный HTTP-ответ без нового вопроса пользователю.
- Если при новой команде нет ни HTTP POST в `access_log`, ни `received`,
  проверьте актуальное `getWebhookInfo` и обратитесь в поддержку Timeweb:
  запрос мог не дойти до PHP. Одного отсутствия записи недостаточно для
  доказательства блокировки: учитывайте задержку обновления логов.

Официальные источники:

- [Timeweb: Crontab и произвольные команды](https://timeweb.com/ru/docs/virtualnyj-hosting/planirovshchik-zadanij-cron/).
- [Timeweb: версия и параметры PHP](https://timeweb.com/ru/docs/virtualnyj-hosting/php/).
- [Telegram: требования HTTPS/webhook и диапазоны IP](https://core.telegram.org/bots/webhooks).
- [Telegram: setWebhook и повторная доставка](https://core.telegram.org/bots/api#setwebhook).

## Команды разработки

```bash
composer install
composer test
composer lint
composer check-platform-reqs
```

Корневой скрипт `scripts/build-timeweb.sh` запускает проверки frontend и
backend и создаёт `frontend/timeweb-frontend.zip` только с production-зависимостями.
