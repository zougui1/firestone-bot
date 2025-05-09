import { z } from 'zod';

import { request } from '../socket'

const responseSchema = z.object({
  Function: z.literal('MagicQuarterReplies'),
  SubFunction: z.literal('GuardianTrainingReply'),
});

const dataSchema = z.unknown();

export const trainGuardian = ({ id }: TrainGuardianOptions) => {
  return request({
    type: 'GuardianTraining',
    parameters: [id],
    responseSchema,
    dataSchema,
  });
}

export interface TrainGuardianOptions {
  id: number;
}
