import { z } from 'zod';

import { request } from '../socket'

const responseSchema = z.object({
  Function: z.literal('BuyPremiumProductReplies'),
  SubFunction: z.literal('DoMapMissionSpeedUpReply'),
});

const dataSchema = z.unknown();

export const speedUpMapMission = ({ id, gems }: SpeedUpMapMissionOptions) => {
  return request({
    type: 'DoMapMissionSpeedUp',
    parameters: [id, gems],
    responseSchema,
    dataSchema,
  });
}

export interface SpeedUpMapMissionOptions {
  id: number;
  gems: number;
}
