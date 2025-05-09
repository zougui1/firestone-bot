import { z } from 'zod';

import { request } from '../socket'

const responseSchema = z.object({
  Function: z.literal('OracleReplies'),
  SubFunction: z.literal('CompleteOracleMissionReply'),
});

const dataSchema = z.unknown();

export const completeRitual = () => {
  return request({
    type: 'ClaimRitual',
    parameters: [],
    responseSchema,
    dataSchema,
  });
}
