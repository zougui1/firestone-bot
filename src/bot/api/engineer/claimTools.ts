import { z } from 'zod';

import { request } from '../socket'

const responseSchema = z.object({
  Function: z.literal('WarfrontReplies'),
  SubFunction: z.literal('ClaimToolsReply'),
});

const dataSchema = z.unknown();

export const claimTools = () => {
  return request({
    type: 'ClaimTools',
    parameters: [],
    responseSchema,
    dataSchema,
  });
}
