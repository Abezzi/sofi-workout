import { getLocales } from 'expo-localization';
import { Language } from '@/src/store/slices/locale/localeSlice';

export const getDeviceLanguage = (): Language => {
  const locales = getLocales();
  const langCode = locales[0]?.languageCode;

  if (langCode?.startsWith('es')) return 'es';
  if (langCode?.startsWith('ko')) return 'ko';
  // english is the fallback language
  return 'en';
};
