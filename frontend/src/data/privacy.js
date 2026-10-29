import { privacyOperator } from './privacyOperator.js';
export { privacyOperator } from './privacyOperator.js';

export const privacyDocuments = {
  ru: {
    title: 'Политика конфиденциальности',
    description: 'Обработка заявок, персональные данные и cookies на сайте Ирины Пуртовой.',
    back: 'Вернуться на сайт', languages: 'Язык документа', contents: 'Содержание',
    updated: 'Редакция от 29 октября 2026 года', country: 'Россия',
    operatorLabel: 'Оператор персональных данных — физическое лицо', contactLabel: 'Обращения по вопросам персональных данных',
    cookieSettings: 'Настройки cookies',
    myTrackerDetails: 'Документация веб-счётчика MyTracker',
    sections: [
      { id: 'scope', title: '1. О сайте и операторе', paragraphs: [
        'Эта политика описывает обработку данных на сайтах iripurtova-languages.com и iripurtova-languages.ru. Оператор — Пуртова Ирина Евгеньевна, физическое лицо, Россия.',
        'Для вопросов, уточнения данных, отзыва согласия и запроса удаления используйте email, указанный выше. Посещение сайта само по себе не означает согласия на обработку заявки или подключение необязательной аналитики.',
      ] },
      { id: 'data', title: '2. Какие данные обрабатываются', paragraphs: [
        'В форме сайта: email, необязательный комментарий, отметка согласия, язык страницы, время отправки и технический идентификатор заявки. Не указывайте в комментарии сведения о здоровье, документы, платёжные данные или другие чувствительные сведения.',
        'Для защиты от злоупотреблений сервер использует IP-адрес запроса; в файлах ограничения частоты формы сохраняется его HMAC-хэш, а не исходный IP. Хостинг может сохранять IP, URL, время запроса и сведения о браузере в технических журналах.',
      ] },
      { id: 'purposes', title: '3. Цели и основания обработки', paragraphs: [
        'Данные заявки нужны, чтобы связаться с вами, ответить на вопросы и согласовать пробное занятие. Согласие в форме относится к обработке заявки; оно не является согласием на рекламные рассылки или аналитику. Отметка не установлена заранее. Без согласия форма не отправляется.',
        'При обработке заявки на основании согласия выполняются получение, запись, хранение, использование для ответа, передача через указанные ниже сервисы, уточнение и удаление данных. Технические данные используются для работы сайта и защиты от спама; аналитика — отдельно и только после разрешения.',
      ] },
      { id: 'services', title: '4. Сервисы и получатели данных', paragraphs: [
        `Timeweb предоставляет хостинг и почтовую инфраструктуру формы. Заявка поступает в почтовый ящик ${privacyOperator.applicationMailbox}, размещённый в Timeweb. Адрес ${privacyOperator.email}, указанный на сайте, используется для обычной переписки и обращений по вопросам персональных данных, но не является основным получателем заявок формы.`,
        'Переход по внешней ссылке открывает отдельный сервис, который обрабатывает данные по собственным правилам и получает согласие пользователя отдельно. Данные формы сайта в такие сервисы не передаются.',
        'MyTracker / Top.Mail.Ru (VK) получает сведения о посещениях только после разрешения аналитики. Счётчик MyTracker 3808064 использует CDN mytopf.com на обоих доменах сайта; при недоступности используется top-fwz1.mail.ru. Код сайта не отправляет в счётчик email, комментарии или ответы анкеты; автоматические события MyTracker должны оставаться выключенными в кабинете сервиса.',
      ] },
      { id: 'retention', title: '5. Сроки хранения и удаление', paragraphs: [
        `Для заявок, которые не привели к занятиям, установлен срок хранения ${privacyOperator.applicationRetentionDays} дней после последнего контакта. По окончании этого срока оператор удаляет заявку из почтового ящика Timeweb, если отсутствует иное законное основание для хранения.`,
        'Если начинаются занятия, цели и сроки дальнейшего хранения необходимо определить отдельно. Обязательные сроки, предусмотренные применимым законодательством, имеют приоритет там, где они действительно применимы.',
        'Срок хранения заявки не задаёт сроки технических журналов, резервных копий или данных, самостоятельно обрабатываемых сторонними платформами. Они зависят от настроек и правил этих сервисов. Cookies и браузерное хранилище описаны отдельно ниже.',
      ] },
      { id: 'cookies', title: '6. Cookies и аналитика', paragraphs: [
        'Сайт использует localStorage браузера: i18nextLng запоминает выбранный язык до очистки хранилища; site_cookie_preferences хранит решение об аналитике, версию уведомления и время выбора. Решение учитывается 180 дней, после чего сайт спрашивает снова. Хранилище независимо для каждого домена.',
        'Скрипт MyTracker запускается только по кнопке «Разрешить» в уведомлении о статистике посещений. До выбора и после отказа он не загружается. Отказ не мешает пользоваться сайтом и формой заявки. Выбор можно изменить кнопкой ниже или в футере. При изменении настроенного счётчика сайт запрашивает согласие заново.',
        'MyTracker может обрабатывать IP-адрес, характеристики устройства и браузера, посещённые страницы, источник перехода и идентификаторы браузера. Для идентификации используются, в частности, tmr_lvid и tmr_lvidTS в cookies и локальном хранилище; tmr_detect относится к работе счётчика. Код отправки просмотра удаляет query и hash из URL и referrer, не задаёт UserID и не отправляет цели. Сроки хранения аналитических данных определяются правилами и настройками сервисов, а не сроком хранения заявок.',
        'При отзыве разрешения сайт удаляет доступные ему данные tmr_lvid, tmr_lvidTS и tmr_detect из браузера. Если загрузка MyTracker уже запрашивалась, страница обновляется, чтобы завершить его работу; несохранённый ввод может потеряться. Новая страница не загружает аналитику без разрешения. Это не удаляет уже переданные данные на серверах сервиса или cookies других доменов.',
      ] },
      { id: 'rights', title: '7. Ваши права и обращения', paragraphs: [
        'Вы можете запросить сведения об обработке ваших данных, их уточнение, прекращение обработки или удаление, а также отозвать согласие. Напишите на email оператора, указав адрес, с которого оставляли заявку, и суть обращения. Не отправляйте паспорт или другие документы без необходимости.',
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
    updated: 'Revision: 29 October 2026', country: 'Russia',
    operatorLabel: 'Personal data controller — private individual', contactLabel: 'Personal data enquiries',
    cookieSettings: 'Cookie settings',
    myTrackerDetails: 'MyTracker web counter documentation',
    sections: [
      { id: 'scope', title: '1. Website and controller', paragraphs: [
        'This policy describes data processing on iripurtova-languages.com and iripurtova-languages.ru. The controller is Irina Evgenyevna Purtova (Пуртова Ирина Евгеньевна), a private individual based in Russia.',
        'Use the email above for questions, corrections, withdrawal of consent or deletion requests. Visiting the website alone does not give consent to process a lesson enquiry or activate optional analytics.',
      ] },
      { id: 'data', title: '2. Data processed', paragraphs: [
        'Website form: email address, optional comment, consent selection, page language, submission time and a technical request identifier. Please do not include health information, identity documents, payment details or other sensitive information in your comment.',
        'The server uses the request IP address to prevent abuse. The form’s rate-limit files store an HMAC hash rather than the original IP address. Hosting logs may contain IP addresses, URLs, request times and browser information.',
      ] },
      { id: 'purposes', title: '3. Purposes and grounds', paragraphs: [
        'Enquiry details are used to contact you, answer questions and arrange a trial lesson. Form consent concerns the enquiry; it is not consent to promotional mailings or analytics. The checkbox is not preselected. The form cannot be sent without consent.',
        'Consent-based enquiry processing includes collection, recording, storage, use to respond, transfer through the services below, correction and deletion. Technical data supports website operation and spam prevention. Analytics is separate and requires permission.',
      ] },
      { id: 'services', title: '4. Services and recipients', paragraphs: [
        `Timeweb provides hosting and the form’s email infrastructure. Enquiries are delivered to ${privacyOperator.applicationMailbox}, a mailbox hosted by Timeweb. The ${privacyOperator.email} address displayed on the website is used for ordinary correspondence and personal-data requests, but is not the primary recipient of website-form enquiries.`,
        'External links open separate services that process data under their own rules and obtain user consent separately. Website-form data is not transferred to those services.',
        'MyTracker / Top.Mail.Ru (VK) receives visit information only after analytics permission. MyTracker counter 3808064 uses the mytopf.com CDN on both website domains, with top-fwz1.mail.ru as a fallback. Website code does not send email addresses, comments or questionnaire answers to the counter; MyTracker automatic events must remain disabled in the service dashboard.',
      ] },
      { id: 'retention', title: '5. Retention and deletion', paragraphs: [
        `Enquiries that do not result in lessons are retained for ${privacyOperator.applicationRetentionDays} days after the last contact. At the end of this period, the controller deletes the enquiry from the Timeweb mailbox unless another lawful basis requires retention.`,
        'If lessons begin, the purposes and retention periods for ongoing processing must be defined separately. Statutory retention obligations take precedence where applicable.',
        'The enquiry retention period does not determine how long technical logs, backups or data independently processed by external platforms are kept. Their retention depends on service settings and rules. Browser storage is described below.',
      ] },
      { id: 'cookies', title: '6. Cookies and analytics', paragraphs: [
        'The website uses browser localStorage: i18nextLng remembers the chosen language until storage is cleared; site_cookie_preferences stores the analytics decision, notice version and choice time. The decision is valid for 180 days, after which the website asks again. Storage is separate for each domain.',
        'The MyTracker script starts only after you choose “Allow” in the visit statistics notice. It does not load before a choice or after refusal. Declining does not prevent use of the website or enquiry form. Change your choice using the button below or in the footer. Changes to the configured counter require a new decision.',
        'MyTracker may process IP addresses, device and browser characteristics, visited pages, referral sources and browser identifiers. Identifiers include tmr_lvid and tmr_lvidTS in cookies and local storage; tmr_detect supports counter operation. Page-view submission removes query strings and fragments from URL and referrer, sets no UserID and sends no goals. Analytics retention depends on service rules and settings, not the enquiry retention period.',
        'Withdrawal removes accessible tmr_lvid, tmr_lvidTS and tmr_detect browser data. If MyTracker was requested, the page refreshes to terminate it; unsaved input may be lost. The new page does not load analytics without permission. This does not delete data already sent to service servers or cookies on other domains.',
      ] },
      { id: 'rights', title: '7. Your rights and requests', paragraphs: [
        'You may request information about processing, correction, cessation of processing or deletion, and withdraw consent. Email the controller from the address used for your enquiry and describe your request. Do not send identity documents unnecessarily.',
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
    updated: 'Version du 29 octobre 2026', country: 'Russie',
    operatorLabel: 'Responsable du traitement — personne physique', contactLabel: 'Questions relatives aux données personnelles',
    cookieSettings: 'Paramètres des cookies',
    myTrackerDetails: 'Documentation du compteur web MyTracker',
    sections: [
      { id: 'scope', title: '1. Site et responsable', paragraphs: [
        'Cette politique décrit le traitement des données sur iripurtova-languages.com et iripurtova-languages.ru. La responsable est Irina Evguenievna Purtova (Пуртова Ирина Евгеньевна), personne physique établie en Russie.',
        'Utilisez l’adresse e-mail ci-dessus pour vos questions, rectifications, retraits du consentement ou demandes de suppression. La simple visite du site ne vaut pas consentement au traitement d’une demande de cours ou à l’activation de statistiques facultatives.',
      ] },
      { id: 'data', title: '2. Données traitées', paragraphs: [
        'Formulaire du site : adresse e-mail, commentaire facultatif, choix du consentement, langue de la page, date d’envoi et identifiant technique de la demande. N’incluez pas d’informations médicales, de pièces d’identité, de données de paiement ou d’autres informations sensibles dans le commentaire.',
        'Le serveur utilise l’adresse IP de la requête pour prévenir les abus. Les fichiers de limitation du formulaire conservent une empreinte HMAC plutôt que l’adresse IP d’origine. Les journaux de l’hébergeur peuvent contenir des adresses IP, URL, dates de requête et informations de navigateur.',
      ] },
      { id: 'purposes', title: '3. Finalités et fondements', paragraphs: [
        'Les données permettent de vous contacter, de répondre à vos questions et d’organiser un cours d’essai. Le consentement du formulaire concerne la demande, pas les communications publicitaires ni les statistiques. La case n’est pas précochée. Le formulaire n’est pas envoyé sans consentement.',
        'Le traitement fondé sur le consentement comprend la collecte, l’enregistrement, la conservation, l’utilisation pour répondre, le transfert via les services ci-dessous, la rectification et la suppression. Les données techniques servent au fonctionnement et à la protection contre le spam. Les statistiques nécessitent une autorisation distincte.',
      ] },
      { id: 'services', title: '4. Services et destinataires', paragraphs: [
        `Timeweb assure l’hébergement et l’infrastructure e-mail du formulaire. Les demandes sont envoyées à ${privacyOperator.applicationMailbox}, une boîte hébergée chez Timeweb. L’adresse ${privacyOperator.email} affichée sur le site sert à la correspondance habituelle et aux demandes relatives aux données personnelles, mais n’est pas le destinataire principal des demandes du formulaire.`,
        'Les liens externes ouvrent des services distincts qui traitent les données selon leurs propres règles et recueillent séparément le consentement de l’utilisateur. Les données du formulaire du site ne sont pas transmises à ces services.',
        'MyTracker / Top.Mail.Ru (VK) reçoit des informations de visite uniquement après autorisation des statistiques. Le compteur MyTracker 3808064 utilise le CDN mytopf.com sur les deux domaines du site, avec top-fwz1.mail.ru en secours. Le code du site ne transmet ni e-mails, ni commentaires, ni réponses au questionnaire au compteur ; les événements automatiques MyTracker doivent rester désactivés dans son tableau de bord.',
      ] },
      { id: 'retention', title: '5. Conservation et suppression', paragraphs: [
        `Les demandes qui ne débouchent pas sur des cours sont conservées ${privacyOperator.applicationRetentionDays} jours après le dernier contact. À l’issue de ce délai, la responsable supprime la demande de la boîte Timeweb, sauf si un autre fondement juridique impose sa conservation.`,
        'Si des cours commencent, les finalités et durées du traitement ultérieur doivent être définies séparément. Les obligations légales de conservation prévalent lorsqu’elles sont applicables.',
        'Cette durée ne détermine pas la conservation des journaux techniques, sauvegardes ou données traitées indépendamment par les plateformes externes. Celle-ci dépend de leurs paramètres et règles. Le stockage dans le navigateur est décrit ci-dessous.',
      ] },
      { id: 'cookies', title: '6. Cookies et statistiques', paragraphs: [
        'Le site utilise le localStorage : i18nextLng mémorise la langue jusqu’à l’effacement du stockage ; site_cookie_preferences conserve le choix des statistiques, la version de l’avis et la date du choix. La décision est valable 180 jours, puis une nouvelle demande est affichée. Le stockage est distinct pour chaque domaine.',
        'Le script MyTracker démarre uniquement après le choix « Autoriser » dans l’avis sur les statistiques de visites. Il ne se charge ni avant le choix ni après un refus. Le refus n’empêche pas d’utiliser le site ou le formulaire. Modifiez votre choix avec le bouton ci-dessous ou dans le pied de page. Tout changement du compteur configuré nécessite un nouveau choix.',
        'MyTracker peut traiter l’adresse IP, les caractéristiques du navigateur et de l’appareil, les pages visitées, la source du trafic et des identifiants de navigateur. tmr_lvid et tmr_lvidTS figurent parmi les identifiants en cookies et stockage local ; tmr_detect sert au fonctionnement du compteur. L’envoi des vues retire les paramètres et fragments des URL et sources, ne définit aucun UserID et n’envoie aucun objectif. La conservation des statistiques dépend des règles et paramètres des services, pas de la durée des demandes.',
        'Le retrait efface les données tmr_lvid, tmr_lvidTS et tmr_detect accessibles au site. Si MyTracker a été demandé, la page s’actualise pour le terminer ; les saisies non enregistrées peuvent être perdues. La nouvelle page ne charge pas les statistiques sans autorisation. Les données déjà transmises au service et les cookies d’autres domaines ne sont pas supprimés.',
      ] },
      { id: 'rights', title: '7. Vos droits et demandes', paragraphs: [
        'Vous pouvez demander des informations sur le traitement, une rectification, un arrêt ou une suppression et retirer votre consentement. Écrivez à la responsable depuis l’adresse e-mail utilisée pour votre demande et indiquez l’objet de votre démarche. N’envoyez pas de pièce d’identité sans nécessité.',
        'Les demandes sont examinées selon les exigences légales applicables. Si un fondement légal impose la poursuite de certains traitements après retrait, la responsable doit l’expliquer. Vous pouvez également contacter l’autorité compétente de protection des données.',
      ] },
      { id: 'security', title: '8. Protection et mises à jour', paragraphs: [
        'Le site utilise HTTPS ; les configurations contenant mots de passe et jetons sont conservées hors du répertoire public. Le traitement est limité aux demandes et au fonctionnement du site. Ne transmettez pas les données d’autrui sans fondement légal.',
        'La politique est mise à jour lors de changements de finalités, services ou catégories de données. La date figure en haut de page. Toute nouvelle finalité facultative nécessite une décision distincte et ne découle pas de la simple visite du site.',
      ] },
    ],
  },
};
