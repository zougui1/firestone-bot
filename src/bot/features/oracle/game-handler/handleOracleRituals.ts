import { Effect, pipe } from 'effect';

import * as api from '../../../api';
import * as eventQueue from '../../../eventQueue';
import { env } from '../../../../env';

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

interface LocalState {
  slot: { status: 'idle' | 'running' | 'unknown' };
}

const state: LocalState = {
  slot: { status: 'unknown' },
}

export const handleOracleRituals = () => {
  return Effect.gen(function* () {
    yield* Effect.log('Claiming ritual');
    yield* api.oracle.completeRitual().pipe(
      Effect.tap(() => state.slot.status = 'idle'),
      Effect.catchTag('TimeoutError', () => pipe(
        Effect.logError('Request to claim ritual timed out'),
      )),
    );

    if (state.slot.status === 'running') {
      yield* eventQueue.add({
        type: 'oracleRitual',
        timeoutMs: env.firestone.blindTimeoutSeconds * 1000,
      });
      return;
    }

    for (const ritual of rituals) {
      const { done } = yield* api.oracle.startRitual({ id: ritual }).pipe(
        Effect.as({ done: true }),
        Effect.catchTag('TimeoutError', () => pipe(
          Effect.logError(`Request to start ritual ${ritual} timed out`),
          Effect.as({ done: false }),
        )),
      );

      if (done) {
        state.slot.status = 'running';

        yield* eventQueue.add({
          type: 'oracleRitual',
          timeoutMs: 40 * 60 * 1000,
        });
        return;
      }
    }

    yield* eventQueue.add({
      type: 'oracleRitual',
      timeoutMs: env.firestone.blindTimeoutSeconds * 1000,
    });
  }).pipe(
    Effect.withLogSpan('oracleRituals'),
    Effect.withSpan('oracleRituals'),
  );
}
