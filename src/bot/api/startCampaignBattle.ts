import { z } from 'zod';

import { request } from './socket'
import { jsonSchema } from '../../utils';

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

export const startCampaignBattle = ({ mission, difficulty }: StartCampaignBattleOptions) => {
  return request({
    type: 'StartCampaignBattle',
    parameters: [mission, difficulty],
    responseSchema,
    dataSchema,
  });
}

export interface StartCampaignBattleOptions {
  mission: number;
  difficulty: number;
}
