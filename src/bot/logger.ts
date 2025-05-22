import { Cause, Logger } from 'effect';

import * as database from './database';
import { getErrorMessage } from '../utils';
import { env } from '../env';

const sanitizeLogMessage = (message: unknown): unknown => {
  if (message instanceof Error) {
    return getErrorMessage(message);
  }

  if (Array.isArray(message)) {
    return message.map(sanitizeLogMessage);
  }

  if (message && typeof message === 'object') {
    const newMessage: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(message)) {
      newMessage[key] = sanitizeLogMessage(value);
    }

    return newMessage;
  }

  return message;
}

const consoleLogger = Logger.prettyLogger({
  colors: env.isDev,
});

const databaseLogger = Logger.make(async data => {
  const logData = Logger.structuredLogger.log(data);

  try {
    await database.log.LogModel.insertOne({
      level: logData.logLevel,
      annotations: Object.keys(logData.annotations).length ? logData.annotations : undefined,
      fiberId: logData.fiberId,
      spans: logData.spans,
      message: sanitizeLogMessage(logData.message),
      date: data.date,
      cause: Cause.match(data.cause, {
        onEmpty: undefined,
        onFail: getErrorMessage,
        onDie: getErrorMessage,
        onInterrupt: () => 'Interruption',
        onSequential: () => undefined,
        onParallel: () => undefined,
      }),
    });
  } catch (error) {
    console.error('Could not insert log into the database:', error);
  }
});

export const logger = Logger.zip(consoleLogger, databaseLogger);
