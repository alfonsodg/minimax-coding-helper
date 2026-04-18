import { join } from 'path';
import { homedir } from 'os';
import { configManager } from '../../config.js';
import { JsonConfigTool } from '../base.js';

export class CrushManager extends JsonConfigTool {
  name = 'crush';
  displayName = 'Crush';
  configPath = join(homedir(), '.config', 'crush', 'crush.json');

  getConfig() {
    return {
      providers: {
        minimax: {
          type: 'openai-compat', base_url: configManager.getBaseUrl('openai'),
          api_key: '$MINIMAX_API_KEY',
          models: [{ id: 'MiniMax-M2.1', name: 'MiniMax M2.1', context_window: 200000, default_max_tokens: 64000 }],
        },
      },
    };
  }

  checkConfigured(c: Record<string, unknown>) {
    return !!(c.providers as Record<string, unknown> | undefined)?.minimax;
  }

  cleanConfig(c: Record<string, unknown>) {
    delete (c.providers as Record<string, unknown> | undefined)?.minimax;
  }
}
