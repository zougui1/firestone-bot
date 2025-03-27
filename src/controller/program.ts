import { ClientSocket } from '../socket';
import { env } from '../env';

export const program = async () => {
  const client = new ClientSocket(env.socket);
  await client.waitStatus();

  client.socket.once('killed', () => {
    console.log('the game has been killed');
    client.socket.disconnect();
  });

  console.log('emit kill');
  client.socket.emit('kill');
}
