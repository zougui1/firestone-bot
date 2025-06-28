import WebSocket from 'ws';

import { env } from './env';

let battleAttempts = 0;

const maxBattleAttempts = 100000;
const userId = env.firestone.userId;
const serverName = env.firestone.server;
const uri = env.firestone.socket.uri;
const global = { mission: 0, difficulty: 0, sessionId: '' };

const stringifyRequest = (request: FirestoneRequest) => {
  const firstPart = [
    request.type,
    request.userId,
    request.sessionId,
    ...request.parameters,
  ].join('|==|');
  const wholeRequest = [
    firstPart,
    serverName,
    831,
  ].join('|-+-|');

  return wholeRequest;
}

export interface FirestoneRequest {
  type: string;
  userId: string;
  sessionId: string;
  parameters: (string | number)[];
  serverName: string;
}

const sendRequest = async (request: FirestoneRequest) => {
  const payload = stringifyRequest(request);
  const data = Buffer.from(payload, 'utf-8');

  await ensureConnection();
  console.log('payload:', payload);
  socket.send(data);
}

const socket = new WebSocket(uri);

const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const ensureConnection = async () => {
  if (socket.readyState !== socket.CONNECTING) {
    return;
  }

  const { promise, resolve, reject } = Promise.withResolvers();

  socket.on('open', resolve);
  socket.on('error', reject);

  try {
    await promise
  } finally {
    socket.off('open', resolve);
    socket.off('error', reject);
  }
}

export const startCampaignBattle = async ({ mission, difficulty, sessionId }: { mission: number; difficulty: number; sessionId: string; }) => {
  global.mission = mission;
  global.difficulty = difficulty;
  global.sessionId = sessionId;

  await sendRequest({
    userId,
    sessionId,
    serverName,
    type: 'StartCampaignBattle',
    parameters: [mission, difficulty],
  });
}

const processCampaignBattleResponse = async (payload: string) => {
  const rawData = JSON.parse(payload);
  const { battleLogEntries } = JSON.parse(rawData.Data[2]);

  console.log(++battleAttempts);

  if (battleLogEntries[battleLogEntries.length - 1].A !== 0) {
    console.log('Battle won');
    return;
  }

  console.log('Battle lost');

  if (battleAttempts < maxBattleAttempts) {
    await sleep(3000);
    startCampaignBattle(global);
  } else {
    battleAttempts = 0;
  }
}

socket.on('open', async () => {
  console.log('Connected to the server');
});

socket.on('message', async message => {
  const payload = message.toString('utf-8');

  try {
    await processCampaignBattleResponse(payload);
  } catch (error) {
    console.error('Error:', error)
    console.log('payload:', payload);
  }
});

socket.on('close', () => {
  console.log('Connection closed');
});

socket.on('error', error => {
  console.error('Websocket error:', error);
});
