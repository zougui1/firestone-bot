import { Command } from 'commander';

const program = new Command();

program.name('firebot');

program
  .command('bot')
  .description('Runs the firestone bot')
  .action(async () => {
    const { program } = await import('./bot');
    await program();
  });

program
  .command('kill')
  .description('Kills the firestone bot')
  .action(async () => {
    const { program } = await import('./controller');
    await program();
  });

program
  .command('campaign')
  .description('Does the campaign battle')
  .option('-m, --mission <number>', 'Mission number', Number)
  .option('-d, --difficulty <number>', 'Difficulty number', Number)
  .action(async ({ mission, difficulty }) => {
    if (!mission) {
      console.error('mission is required');
      return;
    }

    if (!difficulty) {
      console.error('mission is required');
      return;
    }

    const { startCampaignBattle } = await import('./campaign');

    startCampaignBattle({
      mission: mission - 1,
      difficulty: difficulty - 1,
    });
  });

program.parseAsync();
