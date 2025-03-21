import { ServerSocket, ClientSocket } from './socket';
import { env } from './env';
import { sleep } from 'radash';
import { startBot } from './bot';

const serverProgram = async () => {
  const server = new ServerSocket(env.socket);
  let controller = new AbortController();

  const runBot = async () => {
    while (true) {
      controller = new AbortController();

      try {
        await startBot({ signal: controller.signal });
      } catch (error) {
        if (controller.signal.aborted) {
          console.log(controller.signal.reason ? `Aborted: ${controller.signal.reason}` : 'Aborted');
        } else {
          console.error(error);
        }
      } finally {
        await sleep(120_000);
      }
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
