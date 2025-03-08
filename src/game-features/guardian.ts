import { click, press } from '../game-bindings';
import { hotkeys } from '../hotkeys';
import { guardians, store, type GuardianName } from '../store';
import { goToView } from './view';

const navigateGuardians: Record<'left' | 'right', () => Promise<void>> = {
  left: async () => {
    const { currentGuardian } = store.getSnapshot().context;
    const index = guardians.indexOf(currentGuardian);
    const prevGuardian = guardians[index - 1];

    if (prevGuardian) {
      await press({ key: hotkeys.left });
      store.trigger.changeGuardian({ name: prevGuardian });
    }
  },

  right: async () => {
    const { currentGuardian } = store.getSnapshot().context;
    const index = guardians.indexOf(currentGuardian);
    const nextGuardian = guardians[index + 1];

    if (nextGuardian) {
      await press({ key: hotkeys.right });
      store.trigger.changeGuardian({ name: nextGuardian });
    }
  },
};

export const selectGuardian = async (name: GuardianName): Promise<void> => {
  const { currentGuardian } = store.getSnapshot().context;
  const targetIndex = guardians.indexOf(name);
  const currentIndex = guardians.indexOf(currentGuardian);

  if (targetIndex < 0 || currentIndex < 0 || targetIndex === currentIndex) {
    return;
  }

  if (targetIndex < currentIndex) {
    for (let index = targetIndex; index < currentIndex; index++) {
      await navigateGuardians.left();
    }
  }

  for (let index = currentIndex; index < targetIndex; index++) {
    await navigateGuardians.right();
  }
}

export const handleTrainGuardian = async () => {
  await goToView('guardians');

  try {
    await selectGuardian('Grace');
    await click({ left: '60%', top: '72%' });
  } finally {
    await goToView('main');
  }
}
