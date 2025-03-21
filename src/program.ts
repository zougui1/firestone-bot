import { ServerSocket, ClientSocket } from './socket';
import { env } from './env';
import { sleep } from 'radash';
import { startBot } from './bot';

const serverProgram = async () => {
  const server = new ServerSocket(env.socket);
  let controller = new AbortController();

  const runBot = async () => {
    while (true) {
      if (!server.connectedClients) {
        controller = new AbortController();

        try {
          await startBot({ signal: controller.signal });
        } catch (error) {
          console.error(error);

          if (controller.signal.aborted) {
            return;
          }
        }
      }
    }
  }

  // delay the start of the bot to prevent it to start when the
  // client is actually just restarting
  await sleep(3000);

  server.io.on('kill', async () => {
    const { execa } = await import('execa');

    controller.abort();

    const pidResult = await execa('pgrep', ['Firestone']);
    const [pid] = pidResult.stdout.split('\n');

    if (pid) {
      await execa('kill', [pid]);
      await sleep(60000);
      await runBot();
    }
  });

  await runBot();
}

const clientProgram = async () => {
  const client = new ClientSocket(env.socket);
}

const main = async () => {
  if (env.role === 'server') {
    await serverProgram();
  } else {
    await clientProgram();
  }
}

main();
