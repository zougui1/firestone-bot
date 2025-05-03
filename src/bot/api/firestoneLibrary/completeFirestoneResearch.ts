import { z } from 'zod';

import { request } from '../socket'

const responseSchema = z.object({
  Function: z.literal('LibraryReplies'),
  SubFunction: z.literal('CompleteFirestoneResearchReply'),
});

const dataSchema = z.tuple([
  z.number(),
  z.number(),
  z.boolean(),
]);

export const completeFirestoneResearch = ({ tree, slot }: CompleteFirestoneResearchOptions) => {
  return request({
    type: 'CompleteFirestoneResearch',
    parameters: [tree, slot],
    responseSchema,
    dataSchema,
  });
}

export interface CompleteFirestoneResearchOptions {
  tree: number;
  slot: number;
}
