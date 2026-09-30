# Irina Purtova — frontend

Мультиязычный сайт преподавателя на Vite, HTML, CSS и JavaScript с PHP 8.2 API для контактных форм.

```bash
npm install
npm run dev
npm run test
npm run build
npm run build:timeweb
```

Основной контент, ссылки и заглушки находятся в `src/data/content.js`. Временные Figma URL в коде не используются: изображения и SVG хранятся в `public/assets`.

## Выкладка на Timeweb

`npm run build:timeweb` запускает frontend-тесты и сборку, PHP lint,
PHPUnit и Composer platform check, после чего создаёт
`frontend/timeweb-frontend.zip`. Если локального Composer нет, скрипт
использует Docker Composer 2.

1. В панели Timeweb включите SSL для `.com` и `.ru`, а также принудительный HTTPS.
2. Распакуйте содержимое `timeweb-frontend.zip` непосредственно в публичный
   каталог основного сайта `.com`. В корне должны оказаться `index.html`,
   языковые каталоги, `.htaccess` и каталог `api`.
3. Рядом с публичным каталогом создайте закрытый каталог `private`. Например,
   если `DOCUMENT_ROOT` равен `/home/user/public_html`, конфиг должен лежать в
   `/home/user/private/contact-config.php`.
4. Скопируйте туда `backend/config/contact-config.example.php` под именем
   `contact-config.php` и заполните SMTP login/password, From, Gmail получателя,
   случайный HMAC-секрет длиной не менее 32 символов и абсолютный путь
   `rate_limit_dir`.
5. Создайте каталог rate limiter. Он должен принадлежать пользователю PHP и
   иметь права `0700`; конфиг рекомендуется закрыть правами `0600`.
6. Направьте `.ru`, `www.ru` и `www.com` в тот же сайт либо настройте в панели
   Timeweb постоянные редиректы. В поставляемом `.htaccess` также есть правила
   `301` на `https://iripurtova-languages.com` с сохранением пути и query.

Тестовая отправка после публикации:

```bash
curl -i 'https://iripurtova-languages.com/api/contact.php' \
  -H 'Origin: https://iripurtova-languages.com' \
  -H 'Content-Type: application/json' \
  --data '{"email":"your-test@example.com","comment":"Timeweb SMTP test","consent":true,"locale":"ru","website":""}'
```

Ожидаемый ответ — HTTP 200 и `{"ok":true,...}`. Затем проверьте доставку в
Gmail и Reply-To. Конфиг должен быть недоступен по публичному URL; его нет ни в
архиве, ни в Git.
