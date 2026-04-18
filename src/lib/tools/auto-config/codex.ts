import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import * as TOML from 'smol-toml';
import chalk from 'chalk';
import { configManager, maskApiKey } from '../../config.js';
import { i18n } from '../../i18n.js';
import { logger } from '../../logger.js';
import type { ToolManager } from '../base.js';

export class CodexManager implements ToolManager {
  name = 'codex';
  displayName = 'Codex CLI';
  private configPath = join(homedir(), '.codex', 'config.toml');

  isInstalled(): boolean { return true; }

  isConfigured(): boolean {
    if (!existsSync(this.configPath)) return false;
    try {
      const parsed = TOML.parse(readFileSync(this.configPath, 'utf-8'));
      return !!(parsed.model_providers as Record<string, unknown>)?.minimax;
    } catch (err) {
      logger.debug(`Could not parse codex config: ${(err as Error).message}`);
      return false;
    }
  }

  async configure(): Promise<boolean> {
    const apiKey = configManager.getApiKey();
    if (!apiKey) { console.log(chalk.red(i18n.t('messages.no_api_key'))); return false; }

    mkdirSync(join(homedir(), '.codex'), { recursive: true });

    let parsed: Record<string, unknown> = {};
    if (existsSync(this.configPath)) {
      try { parsed = TOML.parse(readFileSync(this.configPath, 'utf-8')); }
      catch (err) { logger.warn(`Could not parse existing codex config: ${(err as Error).message}`); }
    }

    const providers = (parsed.model_providers ?? {}) as Record<string, unknown>;
    providers.minimax = {
      name: 'MiniMax Chat Completions API',
      base_url: configManager.getBaseUrl('openai'),
      env_key: 'MINIMAX_API_KEY',
      wire_api: 'chat',
      requires_openai_auth: false,
    };
    parsed.model_providers = providers;

    const profiles = (parsed.profiles ?? {}) as Record<string, unknown>;
    profiles.m21 = { model: 'codex-MiniMax-M2.1', model_provider: 'minimax' };
    parsed.profiles = profiles;

    try {
      writeFileSync(this.configPath, TOML.stringify(parsed as TOML.TomlPrimitive));
      console.log(chalk.green(`✓ ${this.displayName} ${i18n.t('messages.config_success')}`));
      console.log(chalk.yellow(`  export MINIMAX_API_KEY=<your-key>`));
      console.log(chalk.yellow(`  codex --profile m21`));
      return true;
    } catch (err) {
      logger.error(`Failed to write codex config: ${(err as Error).message}`, err);
      return false;
    }
  }

  async uninstall(): Promise<boolean> {
    if (!existsSync(this.configPath)) return true;
    try {
      const parsed = TOML.parse(readFileSync(this.configPath, 'utf-8'));
      delete (parsed.model_providers as Record<string, unknown>)?.minimax;
      delete (parsed.profiles as Record<string, unknown>)?.m21;
      writeFileSync(this.configPath, TOML.stringify(parsed as TOML.TomlPrimitive));
    } catch (err) {
      logger.error(`Failed to clean codex config: ${(err as Error).message}`, err);
    }
    return true;
  }
}
