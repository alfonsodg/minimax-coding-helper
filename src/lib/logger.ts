import chalk from 'chalk';

export const logger = {
  error: (msg: string, err?: unknown) => {
    console.error(chalk.red(`✗ ${msg}`));
    if (err && process.env.DEBUG) console.error(err instanceof Error ? err.stack : err);
  },
  warn: (msg: string) => console.warn(chalk.yellow(`⚠ ${msg}`)),
  debug: (msg: string) => { if (process.env.DEBUG) console.log(chalk.gray(msg)); },
};
