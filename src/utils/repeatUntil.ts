import { sleep } from 'radash';

export const repeatUntil = async ({ delay }: { delay: number; }, callback: () => Promise<boolean>): Promise<void> => {
  while (!(await callback())) {
    await sleep(delay);
  }
}
