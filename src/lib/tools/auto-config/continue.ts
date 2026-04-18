import { join } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';
import { configManager } from '../../config.js';
import { JsonConfigTool, readJsonSafe, writeJsonSafe } from '../base.js';
import { i18n } from '../../i18n.js';

export class ContinueManager extends JsonConfigTool {
  name = 'continue';
  displayName = 'Continue';
  configPath = join(homedir(), '.continue', 'config.json');

  getConfig() {
    return {
      models: [{
        title: 'MiniMax-M2.1', provider: 'openai', model: 'MiniMax-M2.1',
        apiBase: configManager.getBaseUrl('openai'), apiKey: configManager.getApiKey(),
      }],
    };
  }

  checkConfigured(c: Record<string, unknown>) {
    return (c.models as Array<{ title?: string }> | undefined)?.some(m => m.title?.includes('MiniMax')) ?? false;
  }

  async configure(): Promise<boolean> {
    if (!configManager.getApiKey()) { console.log(chalk.red(i18n.t('messages.no_api_key'))); return false; }
    const existing = readJsonSafe(this.configPath);
    const models = Array.isArray(existing.models)
      ? (existing.models as Array<{ title?: string }>).filter(m => !m.title?.includes('MiniMax'))
      : [];
    existing.models = [...models, ...this.getConfig().models];
    if (!writeJsonSafe(this.configPath, existing)) return false;
    console.log(chalk.green(`✓ ${this.displayName} ${i18n.t('messages.config_success')}`));
    return true;
  }

  cleanConfig(c: Record<string, unknown>) {
    if (Array.isArray(c.models)) {
      c.models = (c.models as Array<{ title?: string }>).filter(m => !m.title?.includes('MiniMax'));
    }
  }
}
