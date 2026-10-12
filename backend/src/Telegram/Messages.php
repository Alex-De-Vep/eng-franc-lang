<?php

declare(strict_types=1);

namespace Iripurtova\Telegram;

use RuntimeException;

/**
 * Localized message catalog. Falls back to English for unsupported locales.
 */
final class Messages
{
    private const SUPPORTED = ['ru', 'en', 'fr'];

    /** @return array<string, string> */
    public function forLocale(string $locale): array
    {
        $locale = in_array($locale, self::SUPPORTED, true) ? $locale : 'en';

        return self::catalog()[$locale];
    }

    public function resolve(string $locale, string $key): string
    {
        $messages = $this->forLocale($locale);

        return $messages[$key] ?? $this->catalog()['en'][$key] ?? $key;
    }

    public function isSupported(string $locale): bool
    {
        return in_array($locale, self::SUPPORTED, true);
    }

    /** @return array<string, array<string, string>> */
    private static function catalog(): array
    {
        return [
            'ru' => [
                'greeting' => "Здравствуйте! 👋\nДавайте оставим заявку на пробное занятие. Я задам несколько коротких вопросов — это займёт всего несколько секунд 😊\n\nНажимая «Начать», вы соглашаетесь на обработку персональных данных.",
                'start' => 'Начать',
                'choose_language' => 'Какой язык вы хотите изучать?',
                'language_en' => 'Английский',
                'language_fr' => 'Французский',
                'ask_name' => 'Пожалуйста, напишите ваше имя.',
                'invalid_name' => 'Имя должно содержать от 2 до 100 символов. Попробуйте ещё раз.',
                'ask_age' => 'Сколько вам лет? Напишите возраст числом.',
                'invalid_age' => 'Пожалуйста, укажите возраст числом от 4 до 100.',
                'ask_city' => 'В каком городе вы живёте?',
                'invalid_city' => 'Название города должно содержать от 2 до 100 символов. Попробуйте ещё раз.',
                'ask_country' => 'В какой стране вы живёте?',
                'invalid_country' => 'Название страны должно содержать от 2 до 100 символов. Попробуйте ещё раз.',
                'ask_goal' => 'Какая у вас цель?',
                'goal_travel' => 'Путешествия',
                'goal_work' => 'Работа',
                'goal_study' => 'Учёба',
                'goal_self' => 'Для себя',
                'goal_other' => 'Другое',
                'ask_level' => 'Какой у вас уровень?',
                'level_beginner' => 'Начальный',
                'level_intermediate' => 'Средний',
                'level_advanced' => 'Продвинутый',
                'level_unknown' => 'Не знаю',
                'ask_contact' => 'Как с вами связаться?',
                'contact_telegram' => 'Telegram',
                'contact_phone' => 'Телефон',
                'ask_phone' => 'Отправьте номер телефона (кнопкой или текстом).',
                'send_contact' => 'Отправить мой контакт',
                'invalid_phone' => 'Введите корректный номер телефона (7–15 цифр).',
                'wrong_contact' => 'Кнопка принадлежит другому пользователю. Отправьте свой контакт.',
                'unexpected' => 'Пожалуйста, используйте кнопки или напишите ответ на текущий вопрос.',
                'sent' => '✅ Заявка отправлена преподавателю.',
                'queued' => '📩 Заявка принята и будет передана автоматически.',
                'queued_notice' => '✅ Ваша заявка передана преподавателю.',
                'tech_error' => '⚠️ Произошла техническая ошибка. Пожалуйста, попробуйте отправить заявку позже.',
                'cancel' => 'Анкета удалена. Начните заново командой /start.',
                'consent_note' => 'Нажимая «Начать», вы соглашаетесь на обработку данных.',
                'rate_limited' => 'Слишком много запросов. Пожалуйста, подождите и попробуйте позже.',
            ],
            'en' => [
                'greeting' => "Hello! 👋\nLet's submit your request for a trial lesson. I'll ask a few short questions — it will only take a few seconds 😊\n\nBy tapping «Start», you consent to the processing of your personal data.",
                'start' => 'Start',
                'choose_language' => 'Which language would you like to learn?',
                'language_en' => 'English',
                'language_fr' => 'French',
                'ask_name' => 'Please write your name.',
                'invalid_name' => 'The name must contain 2 to 100 characters. Please try again.',
                'ask_age' => 'How old are you? Please enter your age as a number.',
                'invalid_age' => 'Please enter an age between 4 and 100.',
                'ask_city' => 'Which city do you live in?',
                'invalid_city' => 'The city name must contain 2 to 100 characters. Please try again.',
                'ask_country' => 'Which country do you live in?',
                'invalid_country' => 'The country name must contain 2 to 100 characters. Please try again.',
                'ask_goal' => 'What is your goal?',
                'goal_travel' => 'Travel',
                'goal_work' => 'Work',
                'goal_study' => 'Study',
                'goal_self' => 'For myself',
                'goal_other' => 'Other',
                'ask_level' => 'What is your level?',
                'level_beginner' => 'Beginner',
                'level_intermediate' => 'Intermediate',
                'level_advanced' => 'Advanced',
                'level_unknown' => 'I don\'t know',
                'ask_contact' => 'How should we contact you?',
                'contact_telegram' => 'Telegram',
                'contact_phone' => 'Phone',
                'ask_phone' => 'Send your phone number (via the button or as text).',
                'send_contact' => 'Send my contact',
                'invalid_phone' => 'Please enter a valid phone number (7–15 digits).',
                'wrong_contact' => 'The button belongs to another user. Please send your own contact.',
                'unexpected' => 'Please use the buttons or reply to the current question.',
                'sent' => '✅ Your application has been sent to the teacher.',
                'queued' => '📩 Your application has been received and will be delivered automatically.',
                'queued_notice' => '✅ Your application has been delivered to the teacher.',
                'tech_error' => '⚠️ A technical error occurred. Please try sending your application later.',
                'cancel' => 'The questionnaire has been deleted. Start again with /start.',
                'consent_note' => 'By tapping «Start», you consent to data processing.',
                'rate_limited' => 'Too many requests. Please wait and try again later.',
            ],
            'fr' => [
                'greeting' => "Bonjour ! 👋\nEnvoyons votre demande pour un cours d'essai. Je vais vous poser quelques questions rapides — cela ne prendra que quelques secondes 😊\n\nEn appuyant sur « Commencer », vous acceptez le traitement de vos données personnelles.",
                'start' => 'Commencer',
                'choose_language' => 'Quelle langue souhaitez-vous apprendre ?',
                'language_en' => 'Anglais',
                'language_fr' => 'Français',
                'ask_name' => 'Veuillez écrire votre nom.',
                'invalid_name' => 'Le nom doit contenir de 2 à 100 caractères. Veuillez réessayer.',
                'ask_age' => 'Quel âge avez-vous ? Saisissez votre âge en chiffres.',
                'invalid_age' => 'Veuillez saisir un âge compris entre 4 et 100 ans.',
                'ask_city' => 'Dans quelle ville habitez-vous ?',
                'invalid_city' => 'Le nom de la ville doit contenir de 2 à 100 caractères. Veuillez réessayer.',
                'ask_country' => 'Dans quel pays habitez-vous ?',
                'invalid_country' => 'Le nom du pays doit contenir de 2 à 100 caractères. Veuillez réessayer.',
                'ask_goal' => 'Quel est votre objectif ?',
                'goal_travel' => 'Voyages',
                'goal_work' => 'Travail',
                'goal_study' => 'Études',
                'goal_self' => 'Pour moi',
                'goal_other' => 'Autre',
                'ask_level' => 'Quel est votre niveau ?',
                'level_beginner' => 'Débutant',
                'level_intermediate' => 'Intermédiaire',
                'level_advanced' => 'Avancé',
                'level_unknown' => 'Je ne sais pas',
                'ask_contact' => 'Comment vous contacter ?',
                'contact_telegram' => 'Telegram',
                'contact_phone' => 'Téléphone',
                'ask_phone' => 'Envoyez votre numéro (via le bouton ou en texte).',
                'send_contact' => 'Envoyer mon contact',
                'invalid_phone' => 'Veuillez saisir un numéro valide (7 à 15 chiffres).',
                'wrong_contact' => 'Le bouton appartient à un autre utilisateur. Envoyez votre propre contact.',
                'unexpected' => 'Veuillez utiliser les boutons ou répondre à la question.',
                'sent' => '✅ Votre demande a été envoyée à la professeure.',
                'queued' => '📩 Votre demande a été reçue et sera transmise automatiquement.',
                'queued_notice' => '✅ Votre demande a été transmise à la professeure.',
                'tech_error' => '⚠️ Une erreur technique est survenue. Réessayez plus tard.',
                'cancel' => 'Le questionnaire a été supprimé. Recommencez avec /start.',
                'consent_note' => 'En appuyant sur « Commencer », vous acceptez le traitement des données.',
                'rate_limited' => 'Trop de requêtes. Veuillez patienter puis réessayer.',
            ],
        ];
    }
}
