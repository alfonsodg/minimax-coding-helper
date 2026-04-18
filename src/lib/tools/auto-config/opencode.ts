import { join } from 'path';
import { homedir } from 'os';
import { configManager } from '../../config.js';
import { JsonConfigTool, readJsonSafe, writeJsonSafe } from '../base.js';

export class OpenCodeManager extends JsonConfigTool {
  name = 'opencode';
  displayName = 'OpenCode';
  configPath = join(homedir(), '.config', 'opencode', 'opencode.json');

  getConfig() {
    return {
      $schema: 'https://opencode.ai/config.json',
      provider: {
        minimax: {
          npm: '@ai-sdk/anthropic',
          options: { baseURL: `${configManager.getBaseUrl('anthropic')}/v1`, apiKey: configManager.getApiKey() },
          models: { 'MiniMax-M2.1': { name: 'MiniMax-M2.1' } },
        },
      },
    };
  }

  checkConfigured(c: Record<string, unknown>) {
    return !!(c.provider as Record<string, unknown> | undefined)?.minimax;
  }

  cleanConfig(c: Record<string, unknown>) {
    delete (c.provider as Record<string, unknown> | undefined)?.minimax;
  }
}
