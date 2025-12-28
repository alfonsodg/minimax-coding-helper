import { Command as Commander } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { configManager } from './config.js';
import { i18n } from './i18n.js';
import { wizard } from './wizard.js';

export class Command {
  private program: Commander;

  constructor() {
    i18n.loadFromConfig(configManager.getLang());
    this.program = new Commander();
    this.setupProgram();
  }

  private getVersion(): string {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8'));
      return pkg.version;
    } catch { return '0.1.0'; }
  }

  private setupProgram(): void {
    this.program
      .name('mhelper')
      .description(i18n.t('cli.title'))
      .version(this.getVersion(), '-v, --version', i18n.t('commands.version'))
      .helpOption('-h, --help', i18n.t('commands.help'));

    this.program.command('init')
      .description(i18n.t('commands.init'))
      .action(() => wizard.runFirstTimeSetup());

    this.program.command('doctor')
      .description(i18n.t('commands.doctor'))
      .action(() => wizard.runDoctor());

    this.program.action(async () => {
      if (configManager.isFirstRun()) {
        console.log(chalk.cyan(i18n.t('messages.first_run')));
        await wizard.runFirstTimeSetup();
      } else {
        await wizard.showMainMenu();
      }
    });

    this.program.addHelpText('after', `
${chalk.bold(i18n.t('cli.examples'))}:
  ${chalk.gray('$ mhelper          # Interactive menu')}
  ${chalk.gray('$ mhelper init     # Setup wizard')}
  ${chalk.gray('$ mhelper doctor   # Health check')}
`);
  }

  async execute(args: string[]): Promise<void> {
    await this.program.parseAsync(args, { from: 'user' });
  }
}
