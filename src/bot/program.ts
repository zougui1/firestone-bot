import { Console, Effect, Fiber, Logger, pipe } from 'effect';
import { RuntimeFiber } from 'effect/Fiber';
import { sleep } from 'radash';
import { NodeSdk } from '@effect/opentelemetry';
import { InMemorySpanExporter, BatchSpanProcessor, ReadableSpan, Span } from '@opentelemetry/sdk-trace-base';
import { type Context } from '@opentelemetry/api';

import { type BotOptions, startBot } from './bot';
import { press } from './api';
import { hotkeys } from './hotkeys';
import * as database from './database';
import { ServerSocket } from '../socket';
import { env } from '../env';
import { getErrorMessage, hrTimeToMicroseconds } from '../utils';
import { threadName } from 'effect/FiberId';

const consoleLogger = Logger.prettyLogger({
  colors: env.isDev,
});

const databaseLogger = Logger.make(data => {
  // TODO remove stack traces from errors in the log
  const log = Logger.structuredLogger.log(data);
  console.log('log:', log);
});

const combinedLogger = Logger.zip(consoleLogger, databaseLogger);

class SpanProcessor extends BatchSpanProcessor {
  onStart(span: Span, parentContext: Context): void {
    super.onStart(span, parentContext);
    console.log('start span:', span);
  }
  onEnd(span: ReadableSpan): void {
    super.onEnd(span);
    const spanContext = span.spanContext();

    console.log('end span:', JSON.stringify({
      resource: {
        attributes: span.resource.attributes,
      },
      instrumentationScope: span.instrumentationLibrary,
      traceId: spanContext.traceId,
      parentId: span.parentSpanId,
      traceState: spanContext.traceState?.serialize(),
      name: span.name,
      id: spanContext.spanId,
      kind: span.kind,
      timestamp: hrTimeToMicroseconds(span.startTime),
      duration: hrTimeToMicroseconds(span.duration),
      attributes: span.attributes,
      status: span.status,
      events: span.events,
      links: span.links,
    }, null, 2));
    process.hrtime
    process.exit();
  }
}

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
          const currentFiber = yield* Effect.fork(startBot(options));
          fiber = currentFiber;
          yield* Fiber.await(currentFiber);
          yield* press({ key: hotkeys.escape });
          yield* Effect.sleep('2 minutes');
        })
        .pipe(Effect.withSpan('firebot'))
        .pipe(Effect.provide(Logger.replace(Logger.defaultLogger, combinedLogger)))
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
          Console.log('stopping bot'),
          Effect.tap(() => interruption),
          Effect.mapBoth({
            onSuccess: () => {
              fiber = undefined;
              return Console.log('bot stopped');
            },
            onFailure: cause => Console.error('Could not stop the bot:', cause),
          }),
        ));
      } else {
        console.log('bot is not running');
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
