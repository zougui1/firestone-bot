import { Effect, pipe } from 'effect';

import { sendRequest } from '../api';

// claim
//* {"Function":"WarfrontReplies","SubFunction":"ClaimToolsReply","Data":[1746183456,750,false]}

export const handleEngineerTools = () => {
  return pipe(
    Effect.log('Claiming tools'),
    Effect.tap(() => sendRequest({ type: 'ClaimTools' })),
  );
}
