import { z } from 'zod';

import { request } from '../socket'
import { jsonSchema } from '../../../utils';

const responseSchema = z.object({
  Function: z.literal('WarfrontReplies'),
  SubFunction: z.literal('StartCampaignBattleReply'),
});

const dataSchema = z.tuple([
  z.string(),
  z.string(),
  jsonSchema(z.object({
    battleLogEntries: z.array(z.object({
      A: z.number(),
    })),
  })),
  z.string(),
  z.boolean(),
]);

const global = { mission: 0, difficulty: 0 };

export const startBattle = ({ mission, difficulty }: StartBattleOptions) => {
  global.mission = mission;
  global.difficulty = difficulty;

  return request({
    type: 'StartCampaignBattle',
    parameters: [mission, difficulty],
    responseSchema,
    dataSchema,
  });
}

export interface StartBattleOptions {
  mission: number;
  difficulty: number;
}
