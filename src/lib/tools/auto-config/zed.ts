import { join } from 'path';
import { homedir } from 'os';
import { configManager } from '../../config.js';
import { JsonConfigTool } from '../base.js';

export class ZedManager extends JsonConfigTool {
  name = 'zed';
  displayName = 'Zed';
  configPath = join(homedir(), '.config', 'zed', 'settings.json');

  getConfig() {
    return {
      language_models: {
        openai: {
          api_url: configManager.getBaseUrl('openai'),
          available_models: [{ name: 'MiniMax-M2.1', max_tokens: 64000 }],
        },
      },
      assistant: { default_model: { provider: 'openai', model: 'MiniMax-M2.1' } },
    };
  }

  checkConfigured(c: Record<string, unknown>) {
    const lm = c.language_models as Record<string, Record<string, string>> | undefined;
    return !!lm?.openai?.api_url?.includes('minimax');
  }

  cleanConfig(c: Record<string, unknown>) {
    const lm = c.language_models as Record<string, unknown> | undefined;
    if (lm?.openai && (lm.openai as Record<string, string>).api_url?.includes('minimax')) {
      delete c.language_models;
      delete c.assistant;
    }
  }
}
