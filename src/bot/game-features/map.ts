import { Effect, pipe } from 'effect';

import { sendRequest } from '../api';

const LoadMapMissionsReply_raw = {
  Data: [
    // JSON string
    {
      currentMissions: [
        {
          T: 23,
          D: 4067,
        },
      ],
    },
  ],
};
const LoadMapMissionsReply_readable = {
  id: 23,
  // original time in seconds; without taking into account mission reduction boosts
  duration: 4067,
};

const mapMissions = {
  'Jungle Terror': 0,
  'Stop the Pirate Raids': 1,
  '': 2, // Southern Island or Stormrock Village
  'Xandor Dock': 3,
  'The Lost Chapter': 4,
  'Ambush in the Trees': 5,
  'Mountain Springs': 6,
  'Cursed Bay': 7,
  'Dragon\'s Cave': 8,
  'Stormspire Accident': 9,
  ' ': 10,
  'Visit the Abbey': 11,
  'Riverside': 12,
  'Calamindor Ruins': 13,
  'Talk To The Farmers': 14,
  'North Sea': 15,
  '  ': 16,
  'Irongard\'s Harbor': 17,
  'Tipsy Wisp Tavern': 18,
  'The Hombor King': 19,
  'Dark Cavern': 20,
  'Snow Wolves': 21,
  'Visit the Northern Tribes': 22,
  'Expose the Spy': 23,
  'Southern Island': 24,
  'Frostfire Gorge': 25,
  'Moonglen\'s Festival': 26,
  'Silverwood\'s Militia': 27,
  'Dark River': 28,
  'Forest Rangers': 29,
  'Protect The Shore': 30,
  'Find The Librarian': 31,
  'Collect The Bounty': 32,
  'The Resistance of Goldfell': 33,
  'Protect The Fishermen': 34,
  'Confront The Orcs': 35,
  'Escort the Merchants': 36,
  'The Pit': 37,
  'The Port of Thal Badur': 38,
  'Sea Monsters': 39,
  'Orc Lieutenant': 40,
  '   ': 41,
  'Explore Hinterlands': 42,
  'Enemy Border': 43,
  'Defend Mythshore': 44,
  'Search The Shipwreck': 45,
  'Close The Portal': 46,
  'Train Elf Archers': 47,
  'Library of Talamer': 48,
  'Border Patrol': 49,
  '    ': 50,
  'Underwater Treasures': 51,
  'Chase the Monster': 52,
  'Ships on Fire': 53,
  'Trade Route': 54,
  'Free The Prisoners': 55,
  'Mission To Bayshire': 56,
  'Retrieve Water Sample': 57,
  'Firestone Power': 58,
  'Search For Survivors': 59,
  'Dreadland Shore': 60,
  'Hydra': 61,
};

const missions = Object.keys(mapMissions);

const loopMissions = <A, E, R>(func: (index: number) => Effect.Effect<A, E, R>) => {
  return Effect.loop(0, {
    while: index => index < missions.length,
    step: index => index + 1,
    body: func,
    discard: true,
  });
}

export const handleMapMissions = () => {
  return pipe(
    Effect.log('Refreshing map missions'),
    Effect.tap(() => sendRequest({
      type: 'DoMapMissionsRefresh',
      parameters: [0],
    })),

    Effect.tap(() => Effect.log('Speeding up missions')),
    Effect.tap(() => loopMissions(index => pipe(
      Effect.logDebug(`Speeding up mission ${missions[index]}`),
      Effect.tap(() => sendRequest({
        type: 'DoMapMissionSpeedUp',
        parameters: [index, 0],
      })),
    ))),

    Effect.tap(() => Effect.log('Claiming missions')),
    Effect.tap(() => loopMissions(index => pipe(
      Effect.logDebug(`Claiming mission ${missions[index]}`),
      Effect.tap(() => sendRequest({
        type: 'CompleteMapMission',
        parameters: [index],
      })),
    ))),

    Effect.tap(() => Effect.log('Starting missions')),
    Effect.tap(() => loopMissions(index => pipe(
      Effect.logDebug(`Starting mission ${missions[index]}`),
      Effect.tap(() => sendRequest({
        type: 'StartMapMission',
        parameters: [index],
      })),
    ))),
  );
}
