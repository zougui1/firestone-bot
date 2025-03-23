import leven from 'fast-levenshtein';

import { goTo } from './view';
import { click, drag, findText } from '../api';

const upgradePriorities = [
  'trainer skills',
  'raining gold',
  'meteorite hunter',
  'expeditioner',

  'prestigious',
  'skip stage',
  'skip wave',

  'energy heroes',
  'attribute damage',
  'damage specialization',
  'precision',
  'all main attributes',
  'leadership',
  'team bonus',

  'firestone effect',
  'medal of honor',
  'critical loot bonus',
  'critical loot chance',

  'weaklings',
  'expose weakness',
  'powerless enemy',
  'powerless boss',

  'mana heroes',
  'rage heroes',
  'fist fight',
  'magic spells',
  'tank specialization',
  'healer specialization',

  'attribute health',
  'attribute armor',
  'guardian power',
  'guardian projectiles',
];
const upgradeSet = new Set(upgradePriorities);


export const handleFirestoneResearch = async () => {
  await goTo.library();


  try {
    const upgrades = new Map<string, Upgrade>();
    // claim loots
    //await click({ left: '50%', top: '15%', debug: true });
    //await click({ left: '50%', top: '80%', debug: true });
    //await click({ left: '90%', top: '50%', debug: true });

    let canScroll = false;
    let scrollX = 0;
    const scrolls: `${number}%`[] = [];

    /*do {
      const [
        allVisibleTexts,
        rightMostTexts,
      ] = await Promise.all([
        findText({
          left: 0,
          top: '15%',
          width: '90%',
          height: '65%',
        }),
        findText({
          left: '70%',
          top: '15%',
          width: '20%',
          height: '65%',
          debug: true,
        }),
      ]);

      for (const text of allVisibleTexts) {
        const textContent = text.content.toLowerCase();

        if (upgrades.has(textContent)) {
          continue;
        }

        if (upgradeSet.has(textContent)) {
          upgrades.set(textContent, {
            ...text,
            text: textContent,
            scrolls,
          });

          continue;
        }

        for (const upgradeName of upgradeSet) {
          if (leven.get(upgradeName, textContent) <= 3) {
            if (upgrades.has(upgradeName)) {
              break;
            }

            upgrades.set(upgradeName, {
              ...text,
              text: upgradeName,
              scrolls,
            });

            break;
          }
        }
      }

      canScroll = rightMostTexts.length > 0;

      if (canScroll) {
        await drag({ left: '70%' });
        scrolls.push('70%');
      }
    } while (canScroll);

    const prioritizedUpgrades = upgradePriorities
      .map(u => upgrades.get(u))
      .filter(Boolean) as Upgrade[];

    console.log('upgrades:', prioritizedUpgrades.map(u => u.text))*/
  } finally {
    //await goTo.main();
  }
}

export interface Upgrade {
  text: string;
  left: number;
  top: number;
  width: number;
  height: number;
  scrolls: `${number}%`[];
}
