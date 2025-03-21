import { sleep } from 'radash';

export const startGame = async () => {
  const { execa } = await import('execa');

  await execa('steam', ['steam://rungameid/1013320']);

  // wait until the game has started
  await sleep(10_000);
}
