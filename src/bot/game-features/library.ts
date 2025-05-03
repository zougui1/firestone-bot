import { Effect, pipe } from 'effect';

import * as database from '../database';
import { sendRequest } from '../api';
import { upgradeMap } from './data';

// replies when claiming a research
// data: [slotIndex, unknown, unknown]
//* { "Function": "LibraryReplies", "SubFunction": "CompleteFirestoneResearchReply", "Data": [0, 1, false] };
//* { "Function": "LibraryReplies", "SubFunction": "CompleteFirestoneResearchReply", "Data": [1, 1, false] };
// replies when starting a research; timestamp is the time at which the research started
//* {"Function":"LibraryReplies","SubFunction":"StartFirestoneResearchReply","Data":[0,24,1746118458]}

const researches = [
  upgradeMap['trainer skills'],
  upgradeMap['expeditioner'],
  upgradeMap['meteorite hunter'],

  upgradeMap['prestigious'],
  upgradeMap['raining gold'],
  upgradeMap['skip stage'],
  upgradeMap['skip wave'],

  upgradeMap['damage specialization'],
  upgradeMap['attribute damage'],
  upgradeMap['energy heroes'],
  upgradeMap['precision'],
  upgradeMap['leadership'],
  upgradeMap['all main attributes'],

  upgradeMap['critical loot bonus'],
  upgradeMap['critical loot chance'],

  upgradeMap['attribute armor'],
  upgradeMap['attribute health'],
  upgradeMap['expose weakness'],
  upgradeMap['powerless enemy'],
  upgradeMap['weaklings'],
  upgradeMap['hero level up cost'],
  upgradeMap['firestone effect'],
  upgradeMap['medal of honor'],
  upgradeMap['powerless boss'],

  upgradeMap['mana heroes'],
  upgradeMap['rage heroes'],
  upgradeMap['fist fight'],
  upgradeMap['magic spells'],
  upgradeMap['tank specialization'],
  upgradeMap['healer specialization'],

  upgradeMap['guardian power'],
  upgradeMap['guardian projectiles'],
];

export const handleFirestoneResearch = () => {
  return Effect.gen(function* () {
    const config = yield* database.config.findOne();
    const firestoneLibrary = config.features.firestoneResearch;
    const tree = firestoneLibrary.treeLevel - 1;

    yield* Effect.log('Speeding up firestone researches');
    yield* sendRequest({
      type: 'DoFirestoneResearchSpeedUp',
      parameters: [tree, 1, 0],
    });
    yield* sendRequest({
      type: 'DoFirestoneResearchSpeedUp',
      parameters: [tree, 0, 0],
    });

    yield* Effect.log('Claiming firestone researches');
    yield* sendRequest({
      type: 'CompleteFirestoneResearch',
      parameters: [tree, 1],
    });
    yield* sendRequest({
      type: 'CompleteFirestoneResearch',
      parameters: [tree, 0],
    });

    yield* Effect.log('Starting firestone researches');
    yield* Effect.loop(0, {
      while: index => index < researches.length,
      step: index => index + 1,
      body: index => pipe(
        Effect.logDebug(`Starting firestone research index: ${index}`),
        Effect.tap(() => sendRequest({
          type: 'StartFirestoneResearch',
          // TODO missing current level parameter
          parameters: [tree - 1, index,],
        })),
      ),
      discard: true,
    });
  });
}
