import { Effect, pipe } from 'effect';

import { sendRequest } from '../api';

//! missing ritual claim, ritual claim
//* {"Function":"OracleReplies","SubFunction":"StartOracleMissionReply","Data":["2"]}
//* {"Function":"OracleReplies","SubFunction":"CompleteOracleMissionReply","Data":["{\"rewards\":[{\"itemType\":\"CCH003\",\"quantity\":1}]}",false]

const ritualMaps = {
  'obedience': 2,
  'serenity': 1,
  'concentration': 3,
  'harmony': 0,
};

const rituals = Object.values(ritualMaps);

export const handleOracleRituals = () => {
  return pipe(
    Effect.log('Claiming ritual'),
    Effect.tap(() => sendRequest({ type: 'ClaimRitual' })),

    Effect.tap(() => Effect.loop(0, {
      while: index => index < rituals.length,
      step: index => index + 1,
      body: index => pipe(
        Effect.log(`Starting ritual ${rituals[index]}`),
        Effect.tap(() => sendRequest({
          type: 'StartRitual',
          parameters: [index],
        })),
      ),
      discard: true,
    })),
  );
}
