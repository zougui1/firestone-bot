import WebSocket from 'ws';

import { env } from './env';

let battleAttempts = 0;

const maxBattleAttempts = 100000;
const userId = env.firestone.userId;
const serverName = env.firestone.server;
const uri = env.firestone.socket.uri;

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

/*const payloads = [
  //*`StartCampaignBattle|==|${userId}|==|${sessionId}|==|${mission}|==|${difficulty}|-+-|${serverName}|-+-|829`,
  // liberation missions
  //*`StartNonCampaignBattle|==|${userId}|==|${sessionId}|==|${`LM${index}`}|-+-|${serverName}|-+-|829`,
  // dungeon missions
  //*`StartNonCampaignBattle|==|${userId}|==|${sessionId}|==|${`DM${index}`}|-+-|${serverName}|-+-|829`,


  // not useful
  //*`AskForMeteorites|==|${userId}|==|${sessionId}|-+-|${serverName}|-+-|829`,
  //*`CompleteMeteoriteResearch|==|${userId}|==|${sessionId}|==|${tree}|==|${17}|==|${currentLevel}|==|${1}|-+-|${serverName}|-+-|829`,
];*/

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

//* AskServerTime
//* InspectUser [userId, 'False']
//* PreviewGuild [guildId, 'False'] (guildId='ieoZN0QNd4MI')
//* GetAllLeaderboardData [id]
//*  - id=0: guild?
//*  - id=1: personal?
//*  - id=2: fellowship?
//*  - id=3: server?
//*  - id=4: rift
//* GetArenaOfKingsOpponents
//! LoadQuests
//! LoadHeroes
//! LoadUserData
//? CafFiend ID: lUd90HdA2wFG

export const test = async ({ sessionId }: { sessionId: string; }) => {
  await sendRequest({
    userId,
    sessionId,
    serverName,
    type: 'OpenGearChest',
    parameters: [5, 1, 6876, 14565378],
  });
  /*const ids = ['LM0', 'LM1', 'LM2', 'LM3', 'LM4', 'LM5', 'LM6', 'LM7', 'LM8', 'DM0', 'DM1'];

  for (const id of ids) {
    await sendRequest({
      userId,
      sessionId,
      serverName,
      type: 'StartNonCampaignBattle',
      parameters: [id],
    });
  }*/
}

socket.on('open', async () => {
  console.log('Connected to the server');
});

socket.on('message', async message => {
  const payload = message.toString('utf-8');

  /*const getJsonEntries = (arr: unknown[]) => arr.filter(d => {
    if (typeof d !== 'string') return false;

    try {
      JSON.parse(d);
      return true;
    } catch (error) {
      return false;
    }
  });

  try {
    const data = (getJsonEntries(JSON.parse(payload).Data) as string[]).map(d => JSON.parse(d));
    const path = require('path');

    require('fs').writeFileSync(
      path.join(__dirname, '../data/temp.json'),
      JSON.stringify(data, null, 2),
    );


  } catch (error) {
    console.error(error);
  }*/

  console.log('payload:', payload);
});

socket.on('close', () => {
  console.log('Connection closed');
});

socket.on('error', error => {
  console.error('Websocket error:', error);
});
