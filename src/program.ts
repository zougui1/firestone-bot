import { Effect, Fiber } from 'effect';
import { RuntimeFiber } from 'effect/Fiber';
import { UnknownException } from 'effect/Cause';

import { ServerSocket, ClientSocket } from './socket';
import { env } from './env';
import { sleep } from 'radash';
import { startBot } from './bot';
import { press } from './api';
import { hotkeys } from './hotkeys';

const serverProgram = async () => {
  const server = new ServerSocket(env.socket);
  let controller = new AbortController();
  let fiber: RuntimeFiber<void, UnknownException | Error> | undefined;

  const runBot = async () => {
    const bot = Effect.loop(true, {
      while: bool => bool,
      step: () => true,
      body: () => Effect.gen(function* () {
        fiber = yield* Effect.fork(startBot());
        yield* Fiber.await(fiber);
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
      console.log('kill bot');
      controller.abort('Killed remotely');

      const { execa } = await import('execa');
      const pidResult = await execa('pgrep', ['Firestone']);
      const [pid] = pidResult.stdout.split('\n');

      if (pid) {
        await execa('kill', [pid]);
      }
    });
  });

  await runBot();
}

const clientProgram = async () => {
  const client = new ClientSocket(env.socket);
  console.log('clientProgram')
  await client.waitStatus();
  console.log('emit kill')
  client.socket.emit('kill');
}

const main = async () => {
  if (env.role === 'server') {
    await serverProgram();
  } else {
    await clientProgram();
  }
}

main();
