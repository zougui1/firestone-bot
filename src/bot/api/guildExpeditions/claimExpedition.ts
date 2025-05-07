import { z } from 'zod';

import { request } from '../socket'

const responseSchema = z.object({
  Function: z.literal('GuildMechanismReplies'),
  SubFunction: z.literal('ClaimExpeditionReply'),
});

const dataSchema = z.tuple([
  z.number(),
  z.number(),
  z.boolean(),
]);

export const claimExpedition = () => {
  return request({
    type: 'ClaimExpedition',
    parameters: [],
    responseSchema,
    dataSchema,
  });
}
