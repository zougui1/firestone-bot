import { z } from 'zod';

import { request } from '../socket'

const responseSchema = z.object({
  Function: z.literal('MapMissionsReplies'),
  SubFunction: z.literal('StartMapMissionReply'),
});

const dataSchema = z.tuple([
  z.number(),
]);

export const startMapMission = ({ id }: StartMapMissionOptions) => {
  return request({
    type: 'StartMapMission',
    parameters: [id],
    responseSchema,
    dataSchema,
  });
}

export interface StartMapMissionOptions {
  id: number;
}
