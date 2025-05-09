import { z } from 'zod';

import { request } from '../socket'

const responseSchema = z.object({
  Function: z.literal('OracleReplies'),
  SubFunction: z.literal('StartOracleMissionReply'),
});

const dataSchema = z.unknown();

export const startRitual = ({ id }: StartRitualOptions) => {
  return request({
    type: 'StartRitual',
    parameters: [id],
    responseSchema,
    dataSchema,
  });
}

export interface StartRitualOptions {
  id: number;
}
