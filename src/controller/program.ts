import { ClientSocket } from '../socket';
import { env } from '../env';

export const program = async () => {
  const client = new ClientSocket(env.socket);
  await client.waitStatus();

  client.socket.once('killed', () => {
    console.log('The bot has been killed');
    client.socket.removeAllListeners();
    client.socket.disconnect();
  });

  client.socket.on('bot-not-running', () => {
    console.log('The bot is not running');
    client.socket.removeAllListeners();
    client.socket.disconnect();
  });

  console.log('Request kill');
  client.socket.emit('kill');
}
