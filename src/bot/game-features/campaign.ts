import { Effect, pipe } from 'effect';

import { sendRequest } from '../api';

export const handleCampaignLoot = () => {
  return pipe(
    Effect.log('Claiming campaign loots'),
    Effect.tap(() => sendRequest({ type: 'ClaimWarfrontCampaignLoot' })),
  );
}

const difficultyButtons = {
  easy: { left: '30%', top: '87%' },
  normal: { left: '45%', top: '87%' },
  hard: { left: '50%', top: '87%' },
} as const;
