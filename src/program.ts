import { Command } from 'commander';

const program = new Command();

program.name('firebot');

program
  .command('bot')
  .description('Runs the firestone bot')
  .option('--disable-preflight-checks', 'disable the checks normally run before the bot starts its routines')
  .action(async (options) => {
    console.log('bot options:', options);
    const { program } = await import('./bot');

    program({
      disabledPreflightChecks: Boolean(options.disablePreflightChecks),
    });
  });

program
  .command('kill')
  .description('Kills the firestone bot')
  .action(async () => {
    const { program } = await import('./controller');
    await program();
  });

program.parseAsync();
