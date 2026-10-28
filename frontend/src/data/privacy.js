import { privacyOperator } from './privacyOperator.js';
export { privacyOperator } from './privacyOperator.js';

export const privacyDocuments = {
  ru: {
    title: 'Политика конфиденциальности',
    description: 'Обработка заявок, персональные данные и cookies на сайте Ирины Пуртовой.',
    back: 'Вернуться на сайт', languages: 'Язык документа', contents: 'Содержание',
    updated: 'Редакция от 23 октября 2026 года', country: 'Россия',
    operatorLabel: 'Оператор персональных данных — физическое лицо', contactLabel: 'Обращения по вопросам персональных данных',
    draft: 'Проект документа. Перед публикацией необходимо проверить юридические требования, порядок передачи и удаления данных.',
    cookieSettings: 'Настройки cookies', yandexDetails: 'Список cookies и сроков хранения Яндекс.Метрики',
    myTrackerDetails: 'Документация веб-счётчика MyTracker',
    sections: [
      { id: 'scope', title: '1. О сайте и операторе', paragraphs: [
        'Эта политика описывает обработку данных на iripurtova-languages.com и iripurtova-languages.ru, а также заявок, оставленных через Telegram-бота, ссылка на которого размещена на сайте. Оператор — Пуртова Ирина Евгеньевна, физическое лицо, Россия.',
        'Для вопросов, уточнения данных, отзыва согласия и запроса удаления используйте email, указанный выше. Посещение сайта само по себе не означает согласия на обработку заявки или подключение необязательной аналитики.',
      ] },
      { id: 'data', title: '2. Какие данные обрабатываются', paragraphs: [
        'В форме сайта: email, необязательный комментарий, отметка согласия, язык страницы, время отправки и технический идентификатор заявки. Не указывайте в комментарии сведения о здоровье, документы, платёжные данные или другие чувствительные сведения.',
        'В Telegram: ответы на вопросы анкеты (например, имя, выбранный язык, цель занятий, возраст, город и страна — в зависимости от текущего сценария), предоставленные контакты, Telegram ID и username, если он доступен. Отправляйте только необходимые для заявки сведения.',
        'Для защиты от злоупотреблений сервер использует IP-адрес запроса; в файлах ограничения частоты формы сохраняется его HMAC-хэш, а не исходный IP. Хостинг может сохранять IP, URL, время запроса и сведения о браузере в технических журналах.',
      ] },
      { id: 'purposes', title: '3. Цели и основания обработки', paragraphs: [
        'Данные заявки нужны, чтобы связаться с вами, ответить на вопросы и согласовать пробное занятие. Согласие в форме относится к обработке заявки; оно не является согласием на рекламные рассылки или аналитику. Отметка не установлена заранее. Без согласия форма не отправляется.',
        'При обработке заявки на основании согласия выполняются получение, запись, хранение, использование для ответа, передача через указанные ниже сервисы, уточнение и удаление данных. Технические данные используются для работы сайта и защиты от спама; аналитика — отдельно и только после разрешения.',
      ] },
      { id: 'services', title: '4. Сервисы и получатели данных', paragraphs: [
        'Timeweb предоставляет хостинг и почтовую отправку формы. Заявка поступает преподавателю в Gmail. При обращении через Telegram сведения проходят через Telegram и Salebot, который обслуживает сценарий анкеты, и направляются преподавателю.',
        'Эти сервисы участвуют только в соответствующем способе обращения: посещение страницы не отправляет анкету в Telegram/Salebot. Переход по внешней ссылке открывает отдельный сервис со своими правилами обработки данных.',
        'Некоторые сервисы, включая Gmail и Telegram, могут обрабатывать данные за пределами России. Основания и условия такой передачи необходимо проверить отдельно перед публикацией этой редакции; эта политика не заменяет обязательные уведомления и требования к локализации данных.',
        'Яндекс.Метрика (Яндекс) и MyTracker / Top.Mail.Ru (VK) получают сведения о посещениях только после разрешения аналитики. Счётчик MyTracker 3808064 использует CDN mytopf.com на обоих доменах сайта. Код сайта не отправляет в счётчики email, комментарии или ответы анкеты; автоматические события MyTracker должны оставаться выключенными в кабинете сервиса.',
      ] },
      { id: 'retention', title: '5. Сроки хранения и удаление', paragraphs: [
        `Для заявок, которые не привели к занятиям, установлен срок хранения ${privacyOperator.applicationRetentionDays} дней после последнего контакта. Оператор должен удалять такие заявки из своей почты и Telegram/Salebot; автоматическое удаление в проекте пока не реализовано.`,
        'Если начинаются занятия, цели и сроки дальнейшего хранения необходимо определить отдельно. Обязательные сроки, предусмотренные применимым законодательством, имеют приоритет там, где они действительно применимы.',
        'Срок хранения заявки не задаёт сроки технических журналов, резервных копий или данных, самостоятельно обрабатываемых сторонними платформами. Они зависят от настроек и правил этих сервисов. Cookies и браузерное хранилище описаны отдельно ниже.',
      ] },
      { id: 'cookies', title: '6. Cookies и аналитика', paragraphs: [
        'Сайт использует localStorage браузера: i18nextLng запоминает выбранный язык до очистки хранилища; site_cookie_preferences хранит решение об аналитике, версию уведомления и время выбора. Решение учитывается 180 дней, после чего сайт спрашивает снова. Хранилище независимо для каждого домена.',
        'Скрипты настроенных счётчиков Яндекс.Метрики и MyTracker запускаются только по кнопке «Разрешить аналитику». До выбора и после отказа они не загружаются. Отказ не мешает пользоваться сайтом и формой заявки. Выбор можно изменить кнопкой ниже или в футере. При изменении состава счётчиков сайт запрашивает согласие заново.',
        'Метрика может обрабатывать IP-адрес, характеристики браузера и устройства, посещённые страницы, источник перехода и идентификаторы браузера. В коде отключены Вебвизор, карта кликов и отслеживание ссылок; параметры query и hash удаляются из отправляемых URL и источника перехода. Настройки кабинета Метрики должны соответствовать этому ограничению.',
        'Например, cookie _ym_uid используется для различения посетителей и имеет срок 1 год, _ym_isad — 20 часов. Полный актуальный перечень опубликован Яндексом по ссылке ниже. Эти сроки не равны 90-дневному сроку хранения заявки.',
        'MyTracker может обрабатывать IP-адрес, характеристики устройства и браузера, посещённые страницы, источник перехода и идентификаторы браузера. Для идентификации используются, в частности, tmr_lvid и tmr_lvidTS в cookies и локальном хранилище; tmr_detect относится к работе счётчика. Код отправки просмотра удаляет query и hash из URL и referrer, не задаёт UserID и не отправляет цели. Сроки хранения аналитических данных определяются правилами и настройками сервисов, а не сроком хранения заявок.',
        'При отзыве разрешения сайт останавливает Метрику и удаляет доступные ему данные _ym, tmr_lvid, tmr_lvidTS и tmr_detect из браузера. Если MyTracker уже загружался, страница обновляется, чтобы завершить его работу; несохранённый ввод может потеряться. Новая страница не загружает аналитику без разрешения. Это не удаляет уже переданные данные на серверах сервисов или cookies других доменов.',
      ] },
      { id: 'rights', title: '7. Ваши права и обращения', paragraphs: [
        'Вы можете запросить сведения об обработке ваших данных, их уточнение, прекращение обработки или удаление, а также отозвать согласие. Напишите на email оператора, указав адрес или Telegram-контакт, с которого оставляли заявку, и суть обращения. Не отправляйте паспорт или другие документы без необходимости.',
        'Запрос рассматривается с учётом применимых требований закона. Если есть законное основание продолжать обработку отдельных данных после отзыва, оператор должен разъяснить его. При необходимости вы можете обратиться в уполномоченный орган по защите персональных данных.',
      ] },
      { id: 'security', title: '8. Защита и изменения политики', paragraphs: [
        'Сайт использует HTTPS; серверные конфигурации с паролями и токенами размещаются вне публичного каталога. Обработка ограничена задачами заявки и работы сайта. Не передавайте через форму чужие данные без законных оснований.',
        'При изменении целей, сервисов или состава данных политика обновляется. Дата редакции указана в начале страницы. Новые необязательные цели обработки требуют отдельного решения пользователя, а не предполагаются из факта посещения сайта.',
      ] },
    ],
  },
  en: {
    title: 'Privacy Policy', description: 'Lesson enquiries, personal data and cookies on Irina Purtova’s website.',
    back: 'Back to the website', languages: 'Document language', contents: 'Contents',
    updated: 'Revision: 23 October 2026', country: 'Russia',
    operatorLabel: 'Personal data controller — private individual', contactLabel: 'Personal data enquiries',
    draft: 'Draft document. Legal requirements and the procedures for transferring and deleting data must be reviewed before publication.',
    cookieSettings: 'Cookie settings', yandexDetails: 'Yandex Metrica cookies and their lifetimes',
    myTrackerDetails: 'MyTracker web counter documentation',
    sections: [
      { id: 'scope', title: '1. Website and controller', paragraphs: [
        'This policy describes data processing on iripurtova-languages.com and iripurtova-languages.ru and enquiries made through the Telegram bot linked from the website. The controller is Irina Evgenyevna Purtova (Пуртова Ирина Евгеньевна), a private individual based in Russia.',
        'Use the email above for questions, corrections, withdrawal of consent or deletion requests. Visiting the website alone does not give consent to process a lesson enquiry or activate optional analytics.',
      ] },
      { id: 'data', title: '2. Data processed', paragraphs: [
        'Website form: email address, optional comment, consent selection, page language, submission time and a technical request identifier. Please do not include health information, identity documents, payment details or other sensitive information in your comment.',
        'Telegram: questionnaire answers (such as your name, chosen language, learning goals, age, city and country, depending on the current flow), contact details you provide, Telegram ID and username if available. Provide only information needed for the enquiry.',
        'The server uses the request IP address to prevent abuse. The form’s rate-limit files store an HMAC hash rather than the original IP address. Hosting logs may contain IP addresses, URLs, request times and browser information.',
      ] },
      { id: 'purposes', title: '3. Purposes and grounds', paragraphs: [
        'Enquiry details are used to contact you, answer questions and arrange a trial lesson. Form consent concerns the enquiry; it is not consent to promotional mailings or analytics. The checkbox is not preselected. The form cannot be sent without consent.',
        'Consent-based enquiry processing includes collection, recording, storage, use to respond, transfer through the services below, correction and deletion. Technical data supports website operation and spam prevention. Analytics is separate and requires permission.',
      ] },
      { id: 'services', title: '4. Services and recipients', paragraphs: [
        'Timeweb provides hosting and form email delivery. The teacher receives enquiries in Gmail. Telegram enquiries pass through Telegram and Salebot, which manages the questionnaire, and are delivered to the teacher.',
        'Services are used for the relevant contact method only: visiting a page does not submit a questionnaire to Telegram or Salebot. External links open separate services with their own data processing rules.',
        'Some services, including Gmail and Telegram, may process data outside Russia. The grounds and conditions for these transfers require separate review before this revision is published. This policy does not replace mandatory notifications or data localisation requirements.',
        'Yandex Metrica (Yandex) and MyTracker / Top.Mail.Ru (VK) receive visit information only after analytics permission. MyTracker counter 3808064 uses the mytopf.com CDN on both website domains. Website code does not send email addresses, comments or questionnaire answers to the counters; MyTracker automatic events must remain disabled in the service dashboard.',
      ] },
      { id: 'retention', title: '5. Retention and deletion', paragraphs: [
        `Enquiries that do not result in lessons have a retention period of ${privacyOperator.applicationRetentionDays} days after the last contact. The controller must delete these enquiries from their email and Telegram/Salebot. Automatic deletion is not implemented in this project.`,
        'If lessons begin, the purposes and retention periods for ongoing processing must be defined separately. Statutory retention obligations take precedence where applicable.',
        'The enquiry retention period does not determine how long technical logs, backups or data independently processed by external platforms are kept. Their retention depends on service settings and rules. Browser storage is described below.',
      ] },
      { id: 'cookies', title: '6. Cookies and analytics', paragraphs: [
        'The website uses browser localStorage: i18nextLng remembers the chosen language until storage is cleared; site_cookie_preferences stores the analytics decision, notice version and choice time. The decision is valid for 180 days, after which the website asks again. Storage is separate for each domain.',
        'Configured Yandex Metrica and MyTracker scripts start only after you choose “Allow analytics”. They do not load before a choice or after refusal. Declining does not prevent use of the website or enquiry form. Change your choice using the button below or in the footer. Changes to the set of counters require a new decision.',
        'Metrica may process IP addresses, browser and device characteristics, visited pages, referral sources and browser identifiers. Website code disables Webvisor, click maps and link tracking; query strings and URL fragments are removed from the page and referral URLs it sends. Metrica account settings must match these restrictions.',
        'For example, _ym_uid distinguishes visitors and lasts one year; _ym_isad lasts 20 hours. Yandex publishes the current full list at the link below. These lifetimes are not the 90-day enquiry retention period.',
        'MyTracker may process IP addresses, device and browser characteristics, visited pages, referral sources and browser identifiers. Identifiers include tmr_lvid and tmr_lvidTS in cookies and local storage; tmr_detect supports counter operation. Page-view submission removes query strings and fragments from URL and referrer, sets no UserID and sends no goals. Analytics retention depends on service rules and settings, not the enquiry retention period.',
        'Withdrawal stops Metrica and removes accessible _ym, tmr_lvid, tmr_lvidTS and tmr_detect browser data. If MyTracker was requested, the page refreshes to terminate it; unsaved input may be lost. The new page does not load analytics without permission. This does not delete data already sent to service servers or cookies on other domains.',
      ] },
      { id: 'rights', title: '7. Your rights and requests', paragraphs: [
        'You may request information about processing, correction, cessation of processing or deletion, and withdraw consent. Email the controller with the email address or Telegram contact used for your enquiry and describe your request. Do not send identity documents unnecessarily.',
        'Requests are considered under applicable legal requirements. If a lawful basis requires continued processing of certain data after withdrawal, the controller must explain it. You may also contact the competent data protection authority.',
      ] },
      { id: 'security', title: '8. Security and policy changes', paragraphs: [
        'The website uses HTTPS; server configurations containing passwords and tokens are stored outside the public directory. Processing is limited to enquiries and website operation. Do not submit other people’s information without a lawful basis.',
        'This policy is updated when purposes, services or data categories change. The revision date appears above. New optional purposes require a separate user decision and are not inferred from visiting the website.',
      ] },
    ],
  },
  fr: {
    title: 'Politique de confidentialité', description: 'Demandes de cours, données personnelles et cookies sur le site d’Irina Purtova.',
    back: 'Retour au site', languages: 'Langue du document', contents: 'Sommaire',
    updated: 'Version du 23 octobre 2026', country: 'Russie',
    operatorLabel: 'Responsable du traitement — personne physique', contactLabel: 'Questions relatives aux données personnelles',
    draft: 'Projet de document. Les exigences juridiques et les procédures de transfert et de suppression des données doivent être vérifiées avant publication.',
    cookieSettings: 'Paramètres des cookies', yandexDetails: 'Cookies de Yandex Metrica et durées de conservation',
    myTrackerDetails: 'Documentation du compteur web MyTracker',
    sections: [
      { id: 'scope', title: '1. Site et responsable', paragraphs: [
        'Cette politique décrit le traitement des données sur iripurtova-languages.com et iripurtova-languages.ru, ainsi que des demandes envoyées via le bot Telegram lié au site. La responsable est Irina Evguenievna Purtova (Пуртова Ирина Евгеньевна), personne physique établie en Russie.',
        'Utilisez l’adresse e-mail ci-dessus pour vos questions, rectifications, retraits du consentement ou demandes de suppression. La simple visite du site ne vaut pas consentement au traitement d’une demande de cours ou à l’activation de statistiques facultatives.',
      ] },
      { id: 'data', title: '2. Données traitées', paragraphs: [
        'Formulaire du site : adresse e-mail, commentaire facultatif, choix du consentement, langue de la page, date d’envoi et identifiant technique de la demande. N’incluez pas d’informations médicales, de pièces d’identité, de données de paiement ou d’autres informations sensibles dans le commentaire.',
        'Telegram : réponses au questionnaire (par exemple nom, langue choisie, objectifs, âge, ville et pays, selon le scénario actif), coordonnées fournies, identifiant Telegram et nom d’utilisateur disponible. Communiquez uniquement les informations nécessaires à votre demande.',
        'Le serveur utilise l’adresse IP de la requête pour prévenir les abus. Les fichiers de limitation du formulaire conservent une empreinte HMAC plutôt que l’adresse IP d’origine. Les journaux de l’hébergeur peuvent contenir des adresses IP, URL, dates de requête et informations de navigateur.',
      ] },
      { id: 'purposes', title: '3. Finalités et fondements', paragraphs: [
        'Les données permettent de vous contacter, de répondre à vos questions et d’organiser un cours d’essai. Le consentement du formulaire concerne la demande, pas les communications publicitaires ni les statistiques. La case n’est pas précochée. Le formulaire n’est pas envoyé sans consentement.',
        'Le traitement fondé sur le consentement comprend la collecte, l’enregistrement, la conservation, l’utilisation pour répondre, le transfert via les services ci-dessous, la rectification et la suppression. Les données techniques servent au fonctionnement et à la protection contre le spam. Les statistiques nécessitent une autorisation distincte.',
      ] },
      { id: 'services', title: '4. Services et destinataires', paragraphs: [
        'Timeweb assure l’hébergement et l’envoi des formulaires par e-mail. L’enseignante reçoit les demandes dans Gmail. Les demandes Telegram transitent par Telegram et Salebot, qui gère le questionnaire, puis sont adressées à l’enseignante.',
        'Chaque service intervient pour le mode de contact concerné : visiter une page n’envoie pas de questionnaire à Telegram ou Salebot. Les liens externes ouvrent des services distincts soumis à leurs propres règles.',
        'Certains services, notamment Gmail et Telegram, peuvent traiter des données hors de Russie. Les fondements et conditions de ces transferts doivent être vérifiés séparément avant publication. Cette politique ne remplace pas les notifications obligatoires ni les exigences de localisation des données.',
        'Yandex Metrica (Yandex) et MyTracker / Top.Mail.Ru (VK) reçoivent des informations de visite uniquement après autorisation des statistiques. Le compteur MyTracker 3808064 utilise le CDN mytopf.com sur les deux domaines du site. Le code du site ne transmet ni e-mails, ni commentaires, ni réponses au questionnaire aux compteurs ; les événements automatiques MyTracker doivent rester désactivés dans son tableau de bord.',
      ] },
      { id: 'retention', title: '5. Conservation et suppression', paragraphs: [
        `Les demandes qui ne débouchent pas sur des cours sont conservées ${privacyOperator.applicationRetentionDays} jours après le dernier contact. La responsable doit les supprimer de sa messagerie et de Telegram/Salebot. La suppression automatique n’est pas implémentée dans ce projet.`,
        'Si des cours commencent, les finalités et durées du traitement ultérieur doivent être définies séparément. Les obligations légales de conservation prévalent lorsqu’elles sont applicables.',
        'Cette durée ne détermine pas la conservation des journaux techniques, sauvegardes ou données traitées indépendamment par les plateformes externes. Celle-ci dépend de leurs paramètres et règles. Le stockage dans le navigateur est décrit ci-dessous.',
      ] },
      { id: 'cookies', title: '6. Cookies et statistiques', paragraphs: [
        'Le site utilise le localStorage : i18nextLng mémorise la langue jusqu’à l’effacement du stockage ; site_cookie_preferences conserve le choix des statistiques, la version de l’avis et la date du choix. La décision est valable 180 jours, puis une nouvelle demande est affichée. Le stockage est distinct pour chaque domaine.',
        'Les scripts Yandex Metrica et MyTracker configurés démarrent uniquement après le choix « Autoriser l’analyse ». Ils ne se chargent ni avant le choix ni après un refus. Le refus n’empêche pas d’utiliser le site ou le formulaire. Modifiez votre choix avec le bouton ci-dessous ou dans le pied de page. Tout changement des compteurs nécessite un nouveau choix.',
        'Metrica peut traiter l’adresse IP, les caractéristiques du navigateur et de l’appareil, les pages visitées, la source du trafic et des identifiants de navigateur. Le code désactive Webvisor, les cartes de clics et le suivi des liens ; les paramètres et fragments sont retirés des URL et sources transmises. Les paramètres du compte Metrica doivent respecter ces restrictions.',
        'Par exemple, _ym_uid distingue les visiteurs et dure un an ; _ym_isad dure 20 heures. Yandex publie la liste complète actualisée via le lien ci-dessous. Ces durées ne correspondent pas aux 90 jours de conservation des demandes.',
        'MyTracker peut traiter l’adresse IP, les caractéristiques du navigateur et de l’appareil, les pages visitées, la source du trafic et des identifiants de navigateur. tmr_lvid et tmr_lvidTS figurent parmi les identifiants en cookies et stockage local ; tmr_detect sert au fonctionnement du compteur. L’envoi des vues retire les paramètres et fragments des URL et sources, ne définit aucun UserID et n’envoie aucun objectif. La conservation des statistiques dépend des règles et paramètres des services, pas de la durée des demandes.',
        'Le retrait arrête Metrica et efface les données _ym, tmr_lvid, tmr_lvidTS et tmr_detect accessibles au site. Si MyTracker a été demandé, la page s’actualise pour le terminer ; les saisies non enregistrées peuvent être perdues. La nouvelle page ne charge pas les statistiques sans autorisation. Les données déjà transmises aux services et les cookies d’autres domaines ne sont pas supprimés.',
      ] },
      { id: 'rights', title: '7. Vos droits et demandes', paragraphs: [
        'Vous pouvez demander des informations sur le traitement, une rectification, un arrêt ou une suppression et retirer votre consentement. Écrivez à la responsable en indiquant l’e-mail ou le contact Telegram utilisé pour votre demande et l’objet de votre démarche. N’envoyez pas de pièce d’identité sans nécessité.',
        'Les demandes sont examinées selon les exigences légales applicables. Si un fondement légal impose la poursuite de certains traitements après retrait, la responsable doit l’expliquer. Vous pouvez également contacter l’autorité compétente de protection des données.',
      ] },
      { id: 'security', title: '8. Protection et mises à jour', paragraphs: [
        'Le site utilise HTTPS ; les configurations contenant mots de passe et jetons sont conservées hors du répertoire public. Le traitement est limité aux demandes et au fonctionnement du site. Ne transmettez pas les données d’autrui sans fondement légal.',
        'La politique est mise à jour lors de changements de finalités, services ou catégories de données. La date figure en haut de page. Toute nouvelle finalité facultative nécessite une décision distincte et ne découle pas de la simple visite du site.',
      ] },
    ],
  },
};
