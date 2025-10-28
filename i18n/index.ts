import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// json translations
import translationEn from './locales/en-US/translation.json';
import translationEs from './locales/es-MX/translation.json';
import translationKo from './locales/ko-KR/translation.json';
import { getDeviceLanguage } from '@/utils/locale';
import { Language } from '@/src/store/slices/locale/localeSlice';

const resources = {
  'en-US': { translation: translationEn },
  'es-MX': { translation: translationEs },
  'ko-KR': { translation: translationKo },
};

const languageToLocale: Record<Language, string> = {
  en: 'en-US',
  es: 'es-MX',
  ko: 'ko-KR',
};

i18n.use(initReactI18next);

export const initializeI18n = (language: Language | null) => {
  const locale = language ? languageToLocale[language] : languageToLocale[getDeviceLanguage()];

  if (i18n.isInitialized) {
    i18n.changeLanguage(locale);
  } else {
    i18n.init({
      resources,
      lng: locale,
      fallbackLng: 'en-US',
      interpolation: {
        escapeValue: false,
      },
    });
  }
};

export default i18n;
