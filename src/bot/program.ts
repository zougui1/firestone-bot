import { Cause, Effect, Exit, Fiber, Logger, LogLevel, pipe } from 'effect';
import { RuntimeFiber } from 'effect/Fiber';
import { sleep } from 'radash';
import { NodeSdk } from '@effect/opentelemetry';
import { InMemorySpanExporter } from '@opentelemetry/sdk-trace-base';

import { type BotOptions, startBot } from './bot';
import { press } from './api';
import { hotkeys } from './hotkeys';
import * as database from './database';
import { ServerSocket } from '../socket';
import { env } from '../env';
import { logger } from './logger';
import { SpanProcessor } from './tracing';

export const program = async (options?: BotOptions) => {
  const server = new ServerSocket(env.socket);
  let fiber: RuntimeFiber<void, unknown> | undefined;

  try {
    await database.connect();
  } catch (error) {
    console.error('database connection error:', error);
  }

  const exporter = new InMemorySpanExporter();
  const NodeSdkLive = NodeSdk.layer(() => ({
    resource: { serviceName: 'firebot' },
    spanProcessor: new SpanProcessor(exporter),
  }));

  const runBot = async () => {
    const bot = Effect.loop(true, {
      while: bool => bool,
      step: () => true,
      body: () => Effect
        .gen(function* () {
          const botEffect = startBot(options);
          const currentFiber = yield* Effect.fork(botEffect);
          fiber = currentFiber;
          const exit = yield* Fiber.await(currentFiber);
          fiber = undefined;

          yield* Exit.match(exit, {
            onSuccess: () => Effect.log('Bot finished'),
            onFailure: cause => Cause.match(cause, {
              onEmpty: Effect.log('Bot terminated'),
              onInterrupt: () => Effect.log('Bot interrupted'),
              onFail: error => Effect.logError('Bot terminated with error:', error),
              onDie: defect => Effect.logFatal('Bot died', defect),
              onParallel: () => Effect.log('Bot terminated'),
              onSequential: () => Effect.log('Bot terminated'),
            }),
          });
          yield* press({ key: hotkeys.escape });
          yield* Effect.sleep('2 minutes');
        })
        .pipe(Effect.withSpan('firebot'))
        .pipe(Effect.provide(Logger.replace(Logger.defaultLogger, logger)))
        .pipe(Logger.withMinimumLogLevel(LogLevel.Info))
        //.pipe(Effect.provide(NodeSdkLive)),
    });

    const result = await Effect.runPromiseExit(bot);

    if (result._tag === 'Failure') {
      console.error('Bot error:', result.cause);
    }
  }

  // delay the start of the bot to prevent it to start when the
  // client is actually just restarting
  await sleep(3000);

  server.io.on('connection', socket => {
    socket.on('kill', async () => {
      console.log('kill process');

      if (fiber) {
        const interruption = Fiber.interrupt(fiber);
        await Effect.runPromise(pipe(
          Effect.log('Stopping bot'),
          Effect.tap(() => interruption),
          Effect.tap(() => Effect.log('Bot stopped')),
          Effect.withSpan('firebot.interruptor'),
          Effect.provide(Logger.replace(Logger.defaultLogger, logger)),
        ));
      } else {
        console.log('bot is not running');
        socket.emit('bot-not-running');
      }

      const { execa } = await import('execa');
      const pidResult = await execa('pgrep', ['Firestone']);
      const [pid] = pidResult.stdout.split('\n');

      if (pid) {
        await execa('kill', [pid]);
        console.log('game killed');
        socket.emit('killed');
      }
    });
  });

  await runBot();
}
