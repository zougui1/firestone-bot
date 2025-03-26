import { Console, Effect, Fiber, pipe } from 'effect';
import { RuntimeFiber } from 'effect/Fiber';
import { sleep } from 'radash';

import { ServerSocket, ClientSocket } from './socket';
import { env } from './env';
import { startBot } from './bot';
import { press } from './api';
import { hotkeys } from './hotkeys';
import * as database from './database';

const botProgram = async () => {
  const server = new ServerSocket(env.socket);
  let fiber: RuntimeFiber<void, unknown> | undefined;

  try {
    await database.connect();
  } catch (error) {
    console.error('database connection error:', error);
  }

  const runBot = async () => {
    const bot = Effect.loop(true, {
      while: bool => bool,
      step: () => true,
      body: () => Effect.gen(function* () {
        const currentFiber = yield* Effect.fork(startBot());
        fiber = currentFiber;
        yield* Fiber.await(currentFiber);
        yield* press({ key: hotkeys.escape });
        yield* Effect.sleep('2 minutes');
      }),
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
            onSuccess: () => Console.log('bot stopped'),
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

const controllerProgram = async () => {
  const client = new ClientSocket(env.socket);
  await client.waitStatus();

  client.socket.once('killed', () => {
    console.log('the game has been killed');
    client.socket.disconnect();
  });

  console.log('emit kill');
  client.socket.emit('kill');
}

const main = async () => {
  if (env.role === 'bot') {
    await botProgram();
  } else {
    await controllerProgram();
  }
}

main();
