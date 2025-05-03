import { Effect, pipe } from 'effect';

import { sendRequest } from '../api';

// claim: [unknown, unknown, unknown]
//* {"Function":"GuildMechanismReplies","SubFunction":"ClaimExpeditionReply","Data":[334,530,false]}
// start: [id, unknown, unknown, startTimestamp]
//* {"Function":"GuildMechanismReplies","SubFunction":"StartExpeditionReply","Data":["GUEXP020",600,378,1746177471]
//* {"Function":"GuildMechanismReplies","SubFunction":"StartExpeditionReply","Data":["GUEXP011",350,221,1746175187]}
// claim
//* {"Function":"GuildMechanismReplies","SubFunction":"StartExpeditionReply","Data":[221,350,1746175187]}

const expeditionCount = 5;
const largestId = 19;

export const handleGuildExpeditions = () => {
  return pipe(
    Effect.log('Claiming expedition'),
    Effect.tap(() => sendRequest({ type: 'ClaimExpedition' })),

    Effect.tap(() => Effect.loop(0, {
      while: index => index < expeditionCount,
      step: index => index + 1,
      body: index => pipe(
        Effect.log(`Starting expedition index: ${index}`),
        Effect.tap(() => sendRequest({
          type: 'StartExpedition',
          parameters: [`GUEXP00${index}`],
        })),
      ),
      discard: true,
    })),
  );
}
