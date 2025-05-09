import { z } from 'zod';

import { request } from '../socket'

const responseSchema = z.object({
  Function: z.literal('AlchemistReplies'),
  SubFunction: z.literal('CompleteAlchemyExperimentReply'),
});

const dataSchema = z.unknown();

export const completeExperiment = ({ tree, slot }: CompleteExperimentOptions) => {
  return request({
    type: 'CompleteAlchemyExperiment',
    parameters: [tree, slot],
    responseSchema,
    dataSchema,
  });
}

export interface CompleteExperimentOptions {
  tree: number;
  slot: number;
}
