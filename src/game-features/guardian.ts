import { goToView } from './view';
import { click } from '../api';

const guardians = ['Vermillion', 'Grace', 'Ankaa', 'Azhar'] as const;
type GuardianName = typeof guardians[number];

const guardianCoordinates = {
  Vermillion: { left: '40%', top: '90%' },
  Grace: { left: '45%', top: '90%' },
  Ankaa: { left: '55%', top: '90%' },
  Azhar: { left: '60%', top: '90%' },
} as const;

export const selectGuardian = async (name: GuardianName): Promise<void> => {
  const guardianCoords = guardianCoordinates[name];
  await click({ ...guardianCoords });
}

export const handleTrainGuardian = async () => {
  await goToView('guardians');

  try {
    console.log('selecting guardian');
    await selectGuardian('Grace');
    console.log('training guardian');
    await click({ left: '60%', top: '72%' });
  } finally {
    await goToView('main');
  }
}
