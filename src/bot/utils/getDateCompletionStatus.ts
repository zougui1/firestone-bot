import { env } from '../../env';

export const getDateCompletionStatus = (date: Date | number) => {
  const now = Date.now();
  const time = date instanceof Date ? date.getTime() : date;

  if (now >= time) {
    return 'complete';
  }

  if (now >= (time + env.firestone.freeDurationSeconds * 1000)) {
    return 'free-speed-up';
  }

  return 'running';
}
