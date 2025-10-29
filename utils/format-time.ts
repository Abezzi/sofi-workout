import { useTranslation } from 'react-i18next';

export const formatTimeLong = (totalSeconds: number): string => {
  const { t } = useTranslation();

  if (totalSeconds <= 0) return `0 ${t('time.minute')}s`;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  let result = '';
  if (hours > 0) {
    result += `${hours} ${t('time.hour')}${hours !== 1 ? 's' : ''} `;
  }
  if (minutes > 0 || hours > 0) {
    result += `${minutes} ${t('time.minute')}${minutes !== 1 ? 's' : ''}`;
  }
  if (seconds > 0) {
    result += ` ${seconds} ${t('time.second')}${seconds !== 1 ? 's' : ''}`;
  }
  return result.trim() || `0 ${t('time.minute')}s`;
};

export const formatTimeShort = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
