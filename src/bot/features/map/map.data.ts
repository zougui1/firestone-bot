import { env } from '../../../env';

const getMinDurationSeconds = (minutes: number) => {
  return minutes * 60 - env.firestone.freeDurationSeconds;
}

const missionTypes = {
  scout: {
    name: 'scout',
    minDurationSeconds: getMinDurationSeconds(15),
    squads: 1,
  },
  adventure: {
    name: 'adventure',
    minDurationSeconds: getMinDurationSeconds(30),
    squads: 1,
  },
  war: {
    name: 'war',
    minDurationSeconds: getMinDurationSeconds(60),
    squads: 1,
  },
  monster: {
    name: 'monster',
    minDurationSeconds: getMinDurationSeconds(60 * 3),
    squads: 2,
  },
  dragon: {
    name: 'dragon',
    minDurationSeconds: getMinDurationSeconds(60 * 2),
    squads: 2,
  },
  naval: {
    name: 'naval',
    minDurationSeconds: getMinDurationSeconds(60 * 3),
    squads: 2,
  },
};

const missionsList = [
  // naval missions
  { id: 54, name: 'Trade Route', type: missionTypes.naval },
  { id: 63, name: 'Pirate Cove', type: missionTypes.naval },
  // monster missions
  { id: 16, name: 'Lake\'s Terror', type: missionTypes.monster },
  { id: 40, name: 'Orc Lieutenant', type: missionTypes.monster },
  { id: 61, name: 'Hydra', type: missionTypes.monster },
  // dragon missions
  { id: 8, name: 'Dragon\'s Cave', type: missionTypes.dragon },
  { id: 25, name: 'Frostfire Gorge', type: missionTypes.dragon },
  { id: 53, name: 'Ships on Fire', type: missionTypes.dragon },
  { id: 62, name: 'Dragon Island', type: missionTypes.dragon },
  // war missions
  { id: 1, name: 'Stop the Pirate Raids', type: missionTypes.war },
  { id: 3, name: 'Xandor Dock', type: missionTypes.war },
  { id: 5, name: 'Ambush in the Trees', type: missionTypes.war },
  { id: 10, name: 'Recruit Solders', type: missionTypes.war },
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
  { id: 2, name: 'Stormrock Village', type: missionTypes.adventure },
  { id: 4, name: 'The Lost Chapter', type: missionTypes.adventure },
  { id: 7, name: 'Cursed Bay', type: missionTypes.adventure },
  { id: 11, name: 'Visit the Abbey', type: missionTypes.adventure },
  { id: 13, name: 'Calamindor Ruins', type: missionTypes.adventure },
  { id: 21, name: 'Snow Wolves', type: missionTypes.adventure },
  { id: 23, name: 'Expose the Spy', type: missionTypes.adventure },
  { id: 24, name: 'Southern Island', type: missionTypes.adventure },
  { id: 27, name: 'Silverwood\'s Militia', type: missionTypes.adventure },
  { id: 33, name: 'The Resistance of Goldfell', type: missionTypes.adventure },
  { id: 42, name: 'Explore Hinterlands', type: missionTypes.adventure },
  { id: 46, name: 'Close The Portal', type: missionTypes.adventure },
  { id: 48, name: 'Library of Talamer', type: missionTypes.adventure },
  { id: 51, name: 'Underwater Treasures', type: missionTypes.adventure },
  { id: 58, name: 'Firestone Power', type: missionTypes.adventure },
  { id: 60, name: 'Dreadland Shore', type: missionTypes.adventure },
  // scout missions
  { id: 0, name: 'Jungle Terror', type: missionTypes.scout },
  { id: 6, name: 'Mountain Springs', type: missionTypes.scout },
  { id: 9, name: 'Stormspire Accident', type: missionTypes.scout },
  { id: 12, name: 'Riverside', type: missionTypes.scout },
  { id: 14, name: 'Talk To The Farmers', type: missionTypes.scout },
  { id: 19, name: 'The Hombor King', type: missionTypes.scout },
  { id: 20, name: 'Dark Cavern', type: missionTypes.scout },
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
  { id: 17, name: 'Irongard\'s Harbor', type: missionTypes.scout },
  { id: 32, name: 'Collect The Bounty', type: missionTypes.scout },
  { id: 41, name: '', type: missionTypes.scout },
  { id: 50, name: '', type: missionTypes.scout },
];

const missionsMap = new Map(missionsList.map(mission => [mission.id, mission]));

export const missions = {
  types: missionTypes,
  list: missionsList,
  map: missionsMap,
};

export type Mission = typeof missionsList[number];
