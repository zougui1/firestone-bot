import WebSocket from 'ws';

let battleAttempts = 0;

const maxBattleAttempts = 100000;
const userId = '8S19Jpu9obJN';
const sessionId = 'gGpsZXpGW9';
const serverName = 'Elmbrook';
const uri = 'wss://ws11.holydaygames.org/';
const global = { mission: 0, difficulty: 0 };

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
    829,
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

export const startCampaignBattle = async ({ mission, difficulty }: { mission: number; difficulty: number; }) => {
  global.mission = mission;
  global.difficulty = difficulty;
  return;

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
    await sleep(1500);
    startCampaignBattle(global);
  } else {
    battleAttempts = 0;
  }
}

socket.on('open', async () => {
  console.log('Connected to the server');

  /*for (let index = 20; index < 50; index++) {
    await sendRequest({
      userId,
      sessionId,
      serverName,
      //type: 'UpdateFreePickaxesStateNew',
      //type: 'LoadFirestoneResearch',
      //parameters: [3, 24, 0],
      type: 'StartExpedition',
      parameters: [`GUEXP${index.toString().padStart(3, '0')}`],
    });
    await sleep(1500);
  }*/
  await sendRequest({
    userId,
    sessionId,
    serverName,
    //type: 'UpdateFreePickaxesStateNew',
    //type: 'LoadFirestoneResearch',
    //parameters: [3, 24, 0],
    type: 'GetAnniversaryEvent',
    parameters: [],
  });
});

socket.on('message', async message => {
  const payload = message.toString('utf-8');
  console.log('payload:', payload)

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
