import { Effect } from 'effect';

import { sendRequest } from '../api';

// claim: [unknown, unknown, unknown]
//* {"Function":"GuildMechanismReplies","SubFunction":"ClaimExpeditionReply","Data":[334,530,false]}
// start: [id, unknown, unknown, startTimestamp]
//* {"Function":"GuildMechanismReplies","SubFunction":"StartExpeditionReply","Data":["GUEXP020",600,378,1746177471]
//* {"Function":"GuildMechanismReplies","SubFunction":"StartExpeditionReply","Data":["GUEXP011",350,221,1746175187]}
// start
//* {"Function":"GuildMechanismReplies","SubFunction":"StartExpeditionReply","Data":[221,350,1746175187]}

const largestId = 19;

export const handleGuildExpeditions = () => {
  return Effect.gen(function* () {
    yield* Effect.log('Claiming expedition');
    yield* sendRequest({ type: 'ClaimExpedition' });

    for (let index = 0; index < largestId; index++) {
      const id = `GUEXP${index.toString().padStart(3, '0')}`;

      yield* Effect.log(`Starting expedition id: ${id}`);
      yield* sendRequest({
        type: 'StartExpedition',
        parameters: [id],
      });
    }
  });
}
