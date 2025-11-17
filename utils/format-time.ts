import { useTranslation } from 'react-i18next';

/**
 * Returns time in this format: HH hour, MM minutes, SS seconds
 */
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
    result += ` ${minutes} ${minutes !== 1 ? t('time.minutes') : t('time.minute')}`;
  }
  if (seconds > 0) {
    result += ` ${seconds} ${seconds !== 1 ? t('time.seconds') : t('time.second')}`;
  }

  return result.trim() || `0 ${t('time.minutes')}`;
};

/**
 * Returns time in this format: (MM:SS) ex. 1 minute and 2 seconds -> (01:02)
 */
export const formatTimeShort = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Returns time in this format: (MM:SS) ex. 1 minute and 2 seconds -> (1:02)
 */
export const formatTimeVeryShort = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (seconds >= 60) {
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return seconds.toString();
};
