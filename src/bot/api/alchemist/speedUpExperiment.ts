import { z } from 'zod';

import { request } from '../socket'

const responseSchema = z.object({
  Function: z.literal('BuyPremiumProductReplies'),
  SubFunction: z.literal('DoAlchemyExperimentSpeedUpReply'),
});

const dataSchema = z.unknown();

export const speedUpExperiment = ({ tree, slot, gems }: SpeedUpExperimentOptions) => {
  return request({
    type: 'DoAlchemyExperimentSpeedUp',
    parameters: [tree, slot, gems],
    responseSchema,
    dataSchema,
  });
}

export interface SpeedUpExperimentOptions {
  tree: number;
  slot: number;
  gems: number;
}
