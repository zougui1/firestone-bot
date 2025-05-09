import { z } from 'zod';

import { request } from '../socket'

const responseSchema = z.object({
  Function: z.literal('WarfrontReplies'),
  SubFunction: z.literal('ClaimWarfrontCampaignLootReply'),
});

const dataSchema = z.unknown();

export const claimLoots = () => {
  return request({
    type: 'ClaimWarfrontCampaignLoot',
    parameters: [],
    responseSchema,
    dataSchema,
  });
}
