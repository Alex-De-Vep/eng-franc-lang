# Contact form backend

PHP 8.2 API для контактных форм. Публичная точка входа —
`api/contact.php`, код приложения находится в `src`, зависимости управляются
через Composer.

Реальная конфигурация хранится вне публичного корня. Скопируйте
`config/contact-config.example.php` в:

```text
dirname($_SERVER['DOCUMENT_ROOT'])/private/contact-config.php
```

Заполните данные ящика Timeweb, Gmail получателя, длинный случайный HMAC-секрет
и путь к каталогу rate limiter с правом записи. Этот файл нельзя добавлять в
Git или архив сайта.

Команды разработки:

```bash
composer install
composer test
composer lint
composer check-platform-reqs
```

Корневой скрипт `scripts/build-timeweb.sh` запускает проверки frontend и
backend и создаёт `frontend/timeweb-frontend.zip` только с production-зависимостями.
