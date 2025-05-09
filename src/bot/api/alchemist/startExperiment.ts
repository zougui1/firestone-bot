import { z } from 'zod';

import { request } from '../socket'

const responseSchema = z.object({
  Function: z.literal('AlchemistReplies'),
  SubFunction: z.literal('StartAlchemyExperimentReply'),
});

const dataSchema = z.unknown();

export const startExperiment = ({ tree, slot }: StartExperimentOptions) => {
  return request({
    type: 'StartAlchemyExperiment',
    parameters: [tree, slot],
    responseSchema,
    dataSchema,
  });
}

export interface StartExperimentOptions {
  tree: number;
  slot: number;
}
