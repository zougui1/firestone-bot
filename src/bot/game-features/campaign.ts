import { Console, Effect, pipe } from 'effect';
import { sleep } from 'radash';

import { goTo } from './view';
import { click, findText } from '../api';
import { repeatUntil } from '../utils';

export const handleCampaignLoot = () => {
  return Effect.scoped(pipe(
    Effect.addFinalizer(() => Effect.orDie(goTo.main())),
    Effect.andThen(() => goTo.campaign()),
    Effect.tap(() => Console.log('claiming campaign loots')),
    Effect.andThen(() => click({ left: '7%', top: '93%' })),
  ));
}

const missions = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  50,
  51,
  52,
  53,
  54,
  55,
  56,
  57,
  58,
  59,
  60,
  61,
  62,
  63,
  64,
  65,
  66,
  67,
  68,
  69,
  70,
  71,
  72,
  73,
  74,
  75,
  76,
  77,
  78,
  79,
  80,
  81,
  82,
  83,
  84,
  85,
  86,
  87,
  88,
  89,
  90,
] as const;

const difficultyButtons = {
  easy: { left: '30%', top: '87%' },
  normal: { left: '45%', top: '87%' },
  hard: { left: '50%', top: '87%' },
} as const;

export const handleCampaignFights = async () => {
  while (true) {
    console.count('fight');
    await Effect.runPromise(click({ left: '52%', top: '77%' }));

    await Effect.runPromise(click({ ...difficultyButtons.easy }));
    await sleep(5000);

    await repeatUntil({ delay: 200 }, async () => {
      const texts = await Effect.runPromise(findText({ top: '69.5%', left: '48%', width: '4%', height: '4%' }));
      return texts.some(text => text.content.toLowerCase() === 'ok');
    });

    console.log('end');
    await Effect.runPromise(click({ left: '50%', top: '80%' }));
  }
}
