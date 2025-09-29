export const formatTime = (totalSeconds: number): string => {
  if (totalSeconds <= 0) return '0 minutes';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  let result = '';
  if (hours > 0) {
    result += `${hours} hour${hours !== 1 ? 's' : ''} `;
  }
  if (minutes > 0 || hours > 0) {
    result += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  if (seconds > 0) {
    result += ` ${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  return result.trim() || '0 minutes';
};
