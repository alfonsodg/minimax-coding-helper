import { join } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';
import { configManager } from '../../config.js';
import { JsonConfigTool, readJsonSafe, writeJsonSafe } from '../base.js';
import { i18n } from '../../i18n.js';

export class DroidManager extends JsonConfigTool {
  name = 'droid';
  displayName = 'Droid';
  configPath = join(homedir(), '.factory', 'config.json');

  getConfig() {
    return {
      custom_models: [{
        model_display_name: 'MiniMax-M2.1', model: 'MiniMax-M2.1',
        base_url: configManager.getBaseUrl('anthropic'),
        api_key: configManager.getApiKey(), provider: 'anthropic', max_tokens: 64000,
      }],
    };
  }

  checkConfigured(c: Record<string, unknown>) {
    return (c.custom_models as Array<{ model?: string }> | undefined)?.some(m => m.model?.includes('MiniMax')) ?? false;
  }

  async configure(): Promise<boolean> {
    if (!configManager.getApiKey()) { console.log(chalk.red(i18n.t('messages.no_api_key'))); return false; }
    const existing = readJsonSafe(this.configPath);
    const models = Array.isArray(existing.custom_models)
      ? (existing.custom_models as Array<{ model?: string }>).filter(m => !m.model?.includes('MiniMax'))
      : [];
    existing.custom_models = [...models, ...this.getConfig().custom_models];
    if (!writeJsonSafe(this.configPath, existing)) return false;
    console.log(chalk.green(`✓ ${this.displayName} ${i18n.t('messages.config_success')}`));
    return true;
  }

  cleanConfig(c: Record<string, unknown>) {
    if (Array.isArray(c.custom_models)) {
      c.custom_models = (c.custom_models as Array<{ model?: string }>).filter(m => !m.model?.includes('MiniMax'));
    }
  }
}
