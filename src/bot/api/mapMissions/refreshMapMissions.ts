import { z } from 'zod';

import { request } from '../socket'

const responseSchema = z.object({
  Function: z.literal('BuyPremiumProductReplies'),
  SubFunction: z.literal('DoMapMissionsRefreshReply'),
});

const dataSchema = z.tuple([
  z.object({
    currentMissions: z.array(z.object({
      T: z.number(),
      D: z.number(),
    }).transform(obj => ({
      id: obj.T,
      durationSeconds: obj.D,
    }))),
  }),
]).transform(([{ currentMissions }]) => ({
  missions: currentMissions,
}));

export const refreshMapMissions = ({ gems }: RefreshMapMissionsOptions) => {
  return request({
    type: 'DoMapMissionsRefresh',
    parameters: [gems],
    responseSchema,
    dataSchema,
  });
}

export interface RefreshMapMissionsOptions {
  gems: number;
}
