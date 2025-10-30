import { useTranslation } from 'react-i18next';

export const formatTimeLong = (totalSeconds: number): string => {
  const { t } = useTranslation();

  if (totalSeconds <= 0) return `0 ${t('time.minutes')}`;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  let result = '';
  if (hours > 0) {
    result += `${hours} ${hours !== 1 ? t('time.hours') : t('time.hour')}`;
  }
  if (minutes > 0 || hours > 0) {
    result += `${minutes} ${minutes !== 1 ? t('time.minutes') : t('time.minute')}`;
  }
  if (seconds > 0) {
    result += ` ${seconds} ${seconds !== 1 ? t('time.seconds') : t('time.second')}`;
  }
  return result.trim() || `0 ${t('time.minutes')}`;
};

export const formatTimeShort = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
