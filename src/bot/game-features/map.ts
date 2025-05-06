import { Effect, pipe } from 'effect';

import * as api from '../api';
import { env } from '../../env';
import { getDateCompletionStatus } from '../utils';

//! missions refresh
//* {"Function":"MapMissionsReplies","SubFunction":"StartMapMissionReply","Data":[54]}
//* {"Function":"MapMissionsReplies","SubFunction":"CompleteMapMissionReply","Data":[36,"{\"rewards\":[{\"itemType\":\"CUR001\",\"quantity\":10},{\"itemType\":\"CUR005\",\"quantity\":1},{\"itemType\":\"CUR009\",\"quantity\":5}]}"]}
//* {"Function":"BuyPremiumProductReplies","SubFunction":"DoMapMissionSpeedUpReply","Data":[5,"{\"rewards\":[{\"itemType\":\"CB002\",\"quantity\":1},{\"itemType\":\"CUR005\",\"quantity\":4},{\"itemType\":\"CUR009\",\"quantity\":20}]}"]}

const missionPerCycle = 26;

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

interface MissionState {
  id: number;
  name: string;
  startDate?: Date;
  claimed?: boolean;
  durationSeconds: number;
  squads: number;
  type: typeof missions[number]['type'];
}

interface LocalState {
  squads: number;
  cycleStartDate?: Date;
  missions: Record<string, MissionState>;
  prevMissions: Record<string, MissionState>;
}

const state: LocalState = {
  squads: 0,
  missions: {},
  prevMissions: {},
};

const missionTypes = {
  scout: {
    name: 'scout',
    averageTimeMinutes: 15,
    squads: 1,
  },
  adventure: {
    name: 'adventure',
    averageTimeMinutes: 30,
    squads: 1,
  },
  war: {
    name: 'war',
    averageTimeMinutes: 60,
    squads: 1,
  },
  monster: {
    name: 'monster',
    averageTimeMinutes: 60 * 3,
    squads: 2,
  },
  dragon: {
    name: 'dragon',
    averageTimeMinutes: 60 * 2,
    squads: 2,
  },
  naval: {
    name: 'naval',
    averageTimeMinutes: 60 * 3,
    squads: 2,
  },
};

const missions = [
  // naval missions
  { id: 54, name: 'Trade Route', type: missionTypes.naval },
  // monster missions
  { id: 16, name: 'Lake\'s Terror', type: missionTypes.monster },
  { id: 40, name: 'Orc Lieutenant', type: missionTypes.monster },
  // dragon missions
  { id: 8, name: 'Dragon\'s Cave', type: missionTypes.dragon },
  { id: 25, name: 'Frostfire Gorge', type: missionTypes.dragon },
  { id: 53, name: 'Ships on Fire', type: missionTypes.dragon },
  { id: 62, name: 'Dragon Island', type: missionTypes.dragon },
  // war missions
  { id: 1, name: 'Stop the Pirate Raids', type: missionTypes.war },
  { id: 3, name: 'Xandor Dock', type: missionTypes.war },
  { id: 5, name: 'Ambush in the Trees', type: missionTypes.war },
  { id: 15, name: 'North Sea', type: missionTypes.war },
  { id: 18, name: 'Tipsy Wisp Tavern', type: missionTypes.war },
  { id: 26, name: 'Moonglen\'s Festival', type: missionTypes.war },
  { id: 29, name: 'Forest Rangers', type: missionTypes.war },
  { id: 30, name: 'Protect The Shore', type: missionTypes.war },
  { id: 34, name: 'Protect The Fishermen', type: missionTypes.war },
  { id: 35, name: 'Confront The Orcs', type: missionTypes.war },
  { id: 37, name: 'The Pit', type: missionTypes.war },
  { id: 39, name: 'Sea Monsters', type: missionTypes.war },
  { id: 44, name: 'Defend Mythshore', type: missionTypes.war },
  { id: 47, name: 'Train Elf Archers', type: missionTypes.war },
  { id: 52, name: 'Chase the Monster', type: missionTypes.war },
  { id: 55, name: 'Free The Prisoners', type: missionTypes.war },
  { id: 56, name: 'Mission To Bayshire', type: missionTypes.war },
  // adventure missions
  { id: 4, name: 'The Lost Chapter', type: missionTypes.adventure },
  { id: 7, name: 'Cursed Bay', type: missionTypes.adventure },
  { id: 11, name: 'Visit the Abbey', type: missionTypes.adventure },
  { id: 13, name: 'Calamindor Ruins', type: missionTypes.adventure },
  { id: 23, name: 'Expose the Spy', type: missionTypes.adventure },
  { id: 24, name: 'Southern Island', type: missionTypes.adventure },
  { id: 27, name: 'Silverwood\'s Militia', type: missionTypes.adventure },
  { id: 33, name: 'The Resistance of Goldfell', type: missionTypes.adventure },
  { id: 42, name: 'Explore Hinterlands', type: missionTypes.adventure },
  { id: 46, name: 'Close The Portal', type: missionTypes.adventure },
  { id: 48, name: 'Library of Talamer', type: missionTypes.adventure },
  { id: 51, name: 'Underwater Treasures', type: missionTypes.adventure },
  { id: 60, name: 'Dreadland Shore', type: missionTypes.adventure },
  // scout missions
  { id: 0, name: 'Jungle Terror', type: missionTypes.scout },
  { id: 6, name: 'Mountain Springs', type: missionTypes.scout },
  { id: 9, name: 'Stormspire Accident', type: missionTypes.scout },
  { id: 12, name: 'Riverside', type: missionTypes.scout },
  { id: 14, name: 'Talk To The Farmers', type: missionTypes.scout },
  { id: 19, name: 'The Hombor King', type: missionTypes.scout },
  { id: 22, name: 'Visit the Northern Tribes', type: missionTypes.scout },
  { id: 28, name: 'Dark River', type: missionTypes.scout },
  { id: 31, name: 'Find The Librarian', type: missionTypes.scout },
  { id: 36, name: 'Escort the Merchants', type: missionTypes.scout },
  { id: 38, name: 'The Port of Thal Badur', type: missionTypes.scout },
  { id: 43, name: 'Enemy Border', type: missionTypes.scout },
  { id: 45, name: 'Search The Shipwreck', type: missionTypes.scout },
  { id: 49, name: 'Border Patrol', type: missionTypes.scout },
  { id: 57, name: 'Retrieve Water Sample', type: missionTypes.scout },
  { id: 59, name: 'Search For Survivors', type: missionTypes.scout },

  // unknown missions
  { id: 2, name: '', type: missionTypes.scout },
  { id: 10, name: '', type: missionTypes.scout },
  { id: 17, name: 'Irongard\'s Harbor', type: missionTypes.scout },
  { id: 20, name: 'Dark Cavern', type: missionTypes.scout },
  { id: 21, name: 'Snow Wolves', type: missionTypes.scout },
  { id: 32, name: 'Collect The Bounty', type: missionTypes.scout },
  { id: 41, name: '', type: missionTypes.scout },
  { id: 50, name: '', type: missionTypes.scout },
  { id: 58, name: 'Firestone Power', type: missionTypes.scout },
  { id: 61, name: 'Hydra', type: missionTypes.scout },
];
const missionMap = new Map(missions.map(mission => [mission.id, mission]));

const getCycleStatus = () => {
  if (!state.cycleStartDate) {
    return 'unknown';
  }

  return getDateCompletionStatus(state.cycleStartDate);
}

const getMissionStatus = (mission: MissionState) => {
  if (!mission.startDate) {
    return 'idle';
  }

  if (mission.claimed) {
    return 'claimed';
  }

  return getDateCompletionStatus(mission.startDate.getTime() + mission.durationSeconds * 1000);
}

const getEnsuredMission = (mission: typeof missions[number]): MissionState => {
  return state.missions[mission.id] ?? {
    id: mission.id,
    name: mission.name,
    squads: mission.type.squads,
    durationSeconds: mission.type.averageTimeMinutes * 60,
    type: mission.type,
  };
}

const speedUpMissions = (missionList: typeof missions, missionStore: Record<string, MissionState>) => {
  return Effect.gen(function* () {
    for (const mission of missionList) {
      yield* Effect.logDebug(`Speeding up mission ${mission.name}`);
      yield* api.mapMissions
        .speedUp({ id: mission.id, gems: 0 })
        .pipe(
          Effect.tap(() => {
            missionStore[mission.name] = getEnsuredMission(mission);
            missionStore[mission.name].claimed = true;
          }),
          Effect.catchTag('TimeoutError', Effect.logError),
        );
    }
  });
}

const completeMissions = (missionList: typeof missions, missionStore: Record<string, MissionState>) => {
  return Effect.gen(function* () {
    for (const mission of missionList) {
      yield* Effect.logDebug(`Claiming mission ${mission.name}`);
      yield* api.mapMissions
        .complete({ id: mission.id })
        .pipe(
          Effect.tap(() => {
            missionStore[mission.name] = getEnsuredMission(mission);
            missionStore[mission.name].claimed = true;
          }),
          Effect.catchTag('TimeoutError', Effect.logError),
        );
    }
  });
}

export const handleMapMissions = () => {
  return Effect.gen(function* () {
    yield* Effect.log('Refreshing map missions');
    const cycleStatus = getCycleStatus();

    if (state.cycleStartDate) {
      const now = Date.now();
      const cycleTime = state.cycleStartDate.getTime();

      // clear all missions if the last registered cycle is 2 cycles old
      if ((cycleTime + env.firestone.cycleDurationSeconds * 2 * 1000) >= now) {
        state.missions = {};
        state.prevMissions = {};
      // move all started missions to old missions if last registered cycle is 1 cycle old
      } else if ((cycleTime + env.firestone.cycleDurationSeconds * 1000) >= now) {
        state.prevMissions = {};

        for (const mission of Object.values(state.missions)) {
          // keep only started missions that haven't been claimed
          if (mission.startDate && !mission.claimed) {
            state.prevMissions[mission.name] = mission;
          }
        }

        state.missions = {};
      }
    }

    if (cycleStatus !== 'running') {
      const result = yield* api.mapMissions
        .refresh({ gems: 0 })
        .pipe(
          Effect.tapError(() => Effect.succeed(delete state.cycleStartDate)),
          Effect.catchTag('TimeoutError', Effect.logError),
      );

      state.prevMissions = {};

      for (const mission of Object.values(state.missions)) {
        // keep only started missions
        if (mission.startDate && !mission.claimed) {
          state.prevMissions[mission.name] = mission;
        }
      }

      state.missions = {};

      for (const newMission of (result && result.missions) ?? []) {
        const mission = missionMap.get(newMission.id);

        if (!mission) {
          yield* Effect.logWarning(`There is no mission with ID ${newMission.id}`);
          continue;
        }

        state.missions[mission.name] = getEnsuredMission(mission);
        // real duration is always lower than original duration thanks to various boosts
        state.missions[mission.name].durationSeconds = newMission.durationSeconds / 2.5;
      }
    }

    if (cycleStatus === 'complete' || cycleStatus === 'free-speed-up') {
      state.cycleStartDate = new Date();
    }

    yield* Effect.log('Speeding up missions');

    const prevMissionsToSpeedUp = Object.values(state.prevMissions).filter(mission => getMissionStatus(mission) === 'free-speed-up');

    const missionsToSpeedUp = state.cycleStartDate
      ? Object.values(state.missions).filter(mission => getMissionStatus(mission) === 'free-speed-up')
      : missions;

    yield* speedUpMissions(prevMissionsToSpeedUp, state.prevMissions);
    yield* speedUpMissions(missionsToSpeedUp, state.missions);


    yield* Effect.log('Claiming missions');

    const prevMissionsToComplete = Object.values(state.prevMissions).filter(mission => getMissionStatus(mission) === 'complete');
    const missionsToComplete = state.cycleStartDate
      ? Object.values(state.missions).filter(mission => getMissionStatus(mission) === 'complete')
      : missions;

    yield* completeMissions(prevMissionsToComplete, state.prevMissions);
    yield* completeMissions(missionsToComplete, state.missions);

    yield* Effect.log('Starting missions');

    const unstartedMissions = state.cycleStartDate
      ? Object.values(state.missions).filter(mission => !mission.startDate)
      // if the state of the cycle is unknown then we try to start every mission one by one
      // except for those that have already been started
      : missions.filter(mission => !state.missions[mission.name]?.startDate);

    for (const mission of unstartedMissions) {
      yield* Effect.logDebug(`Starting mission ${mission.name}`);
      yield* api.mapMissions
        .start({ id: mission.id })
        .pipe(
          Effect.tap(() => {
            state.missions[mission.id] = getEnsuredMission(mission);
            state.missions[mission.id].startDate = new Date();
          }),
          Effect.catchTag('TimeoutError', Effect.logError),
        );
    }
  }).pipe(
    Effect.withLogSpan('mapMissions'),
    Effect.withSpan('mapMissions'),
  );
}
