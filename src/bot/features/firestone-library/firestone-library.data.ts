const upgradesObject = {
  /*'prestigious': {
    name: 'prestigious',
    id: -1,
    maxLevel: 40,
  },
  'trainer skills': {
    name: 'trainer skills',
    id: -1,
    maxLevel: 25,
  },
  'meteorite hunter': {
    name: 'meteorite hunter',
    id: -1,
    maxLevel: 15,
  },
  'expeditioner': {
    name: 'expeditioner',
    id: -1,
    maxLevel: 20,
  },
  'skip stage': {
    name: 'skip stage',
    id: -1,
    maxLevel: 20,
  },
  'skip wave': {
    name: 'skip wave',
    id: -1,
    maxLevel: 25,
  },
  'medal of honor': {
    name: 'medal of honor',
    id: -1,
    maxLevel: 12,
  },
  'critical loot bonus': {
    name: 'critical loot bonus',
    id: -1,
    maxLevel: 30,
  },
  'critical loot chance': {
    name: 'critical loot chance',
    id: -1,
    maxLevel: 20,
  },*/

  'raining gold': {
    name: 'raining gold',
    id: 6,
    maxLevel: 60,
  },

  'damage specialization': {
    name: 'damage specialization',
    id: 28,
    maxLevel: 55,
  },
  'attribute damage': {
    name: 'attribute damage',
    id: 0,
    maxLevel: 60,
  },
  'energy heroes': {
    name: 'energy heroes',
    id: -1,
    maxLevel: 60,
  },
  'precision': {
    name: 'precision',
    id: -1,
    maxLevel: 55,
  },
  'leadership': {
    name: 'leadership',
    id: 30,
    maxLevel: 60,
  },
  'all main attributes': {
    name: 'all main attributes',
    id: 20,
    maxLevel: 60,
  },

  'attribute armor': {
    name: 'attribute armor',
    id: 2,
    maxLevel: 60,
  },
  'attribute health': {
    name: 'attribute health',
    id: 1,
    maxLevel: 60,
  },
  'expose weakness': {
    name: 'expose weakness',
    id: 10,
    maxLevel: 30,
  },
  'powerless enemy': {
    name: 'powerless enemy',
    id: 21,
    maxLevel: 30,
  },
  'weaklings': {
    name: 'weaklings',
    id: 9,
    maxLevel: 30,
  },
  'firestone effect': {
    name: 'firestone effect',
    id: 24,
    maxLevel: 55,
  },
  'powerless boss': {
    name: 'powerless boss',
    id: 22,
    maxLevel: 30,
  },

  'team bonus': {
    name: 'team bonus',
    id: 31,
    maxLevel: 60,
  },
  'mana heroes': {
    name: 'mana heroes',
    id: -1,
    maxLevel: 60,
  },
  'rage heroes': {
    name: 'rage heroes',
    id: -1,
    maxLevel: 60,
  },
  'fist fight': {
    name: 'fist fight',
    id: -1,
    maxLevel: 55,
  },
  'magic spells': {
    name: 'magic spells',
    id: -1,
    maxLevel: 55,
  },
  'tank specialization': {
    name: 'tank specialization',
    id: -1,
    maxLevel: 55,
  },
  'healer specialization': {
    name: 'healer specialization',
    id: -1,
    maxLevel: 55,
  },

  'guardian power': {
    name: 'guardian power',
    id: 4,
    maxLevel: 60,
  },
};

const map = new Map(Object.entries(upgradesObject));

export const upgrades = {
  ...upgradesObject,
  get: map.get.bind(map),
};

export type Upgrade = typeof upgradesObject['all main attributes'];

export const researches = [
  //upgradeMap['trainer skills'],
  //upgradeMap['expeditioner'],
  //upgradeMap['meteorite hunter'],

  //upgradeMap['prestigious'],
  upgrades['raining gold'],
  //upgradeMap['skip stage'],
  //upgradeMap['skip wave'],

  upgrades['damage specialization'],
  upgrades['attribute damage'],
  upgrades['energy heroes'],
  upgrades['precision'],
  upgrades['leadership'],
  upgrades['all main attributes'],

  //upgradeMap['critical loot bonus'],
  //upgradeMap['critical loot chance'],

  upgrades['attribute armor'],
  upgrades['attribute health'],
  upgrades['expose weakness'],
  upgrades['powerless enemy'],
  upgrades['weaklings'],
  upgrades['firestone effect'],
  //upgradeMap['medal of honor'],
  upgrades['powerless boss'],

  upgrades['mana heroes'],
  upgrades['rage heroes'],
  upgrades['fist fight'],
  upgrades['magic spells'],
  upgrades['tank specialization'],
  upgrades['healer specialization'],

  upgrades['guardian power'],
  //upgradeMap['guardian projectiles'],
];
