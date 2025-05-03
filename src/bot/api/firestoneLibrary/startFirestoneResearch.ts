import { z } from 'zod';

import { request } from '../socket'

const responseSchema = z.object({
  Function: z.literal('LibraryReplies'),
  SubFunction: z.literal('StartFirestoneResearchReply'),
});

const dataSchema = z.tuple([
  z.number(),
  z.number(),
  z.number(),
]);

export const startFirestoneResearch = ({ tree, id, currentLevel }: StartFirestoneResearchOptions) => {
  return request({
    type: 'StartFirestoneResearch',
    parameters: [tree, id, currentLevel],
    responseSchema,
    dataSchema,
  });
}

export interface StartFirestoneResearchOptions {
  tree: number;
  id: number;
  currentLevel: number;
}
