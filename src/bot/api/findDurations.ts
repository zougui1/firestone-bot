import { Effect, pipe } from 'effect';

import { findText, type TextResult, type FindTextOptions } from './findText';
import { durationToSeconds, normalizeDuration } from '../utils';

export class InvalidDurationError extends Error {
  readonly _tag = 'InvalidDurationError';
  durations: TextResult[];

  constructor(durations: TextResult[]) {
    super();
    this.durations = durations;
  }
}

export class NoDurationError extends Error {
  readonly _tag = 'NoDurationError';
}

export const findDurations = (options: FindTextOptions) => {
  return pipe(
    findText(options),
    Effect.flatMap(texts => Effect.partition(texts, text => {
      const duration = normalizeDuration(text.content);
      const seconds = durationToSeconds(duration);

      if (seconds === undefined) {
        return Effect.fail(text);
      }

      return Effect.succeed({
        ...text,
        seconds,
        content: duration,
      });
    })),
    Effect.tap(Effect.logDebug),
    Effect.flatMap(([invalidDurations, validDurations]) => Effect.gen(function* () {
      if (invalidDurations.length) {
        yield* Effect.fail(new InvalidDurationError(invalidDurations));
      }

      if (!validDurations.length) {
        yield* Effect.fail(new NoDurationError());
      }

      return validDurations;
    })),
  );
}
