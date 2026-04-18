import { join } from 'path';
import { homedir } from 'os';
import { configManager } from '../../config.js';
import { JsonConfigTool } from '../base.js';

export class ClaudeCodeManager extends JsonConfigTool {
  name = 'claude-code';
  displayName = 'Claude Code';
  configPath = join(homedir(), '.claude', 'settings.json');

  getConfig() {
    return {
      env: {
        ANTHROPIC_BASE_URL: configManager.getBaseUrl('anthropic'),
        ANTHROPIC_AUTH_TOKEN: configManager.getApiKey(),
        API_TIMEOUT_MS: '3000000',
        CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: 1,
        ANTHROPIC_MODEL: 'MiniMax-M2.1',
        ANTHROPIC_SMALL_FAST_MODEL: 'MiniMax-M2.1',
        ANTHROPIC_DEFAULT_SONNET_MODEL: 'MiniMax-M2.1',
        ANTHROPIC_DEFAULT_OPUS_MODEL: 'MiniMax-M2.1',
        ANTHROPIC_DEFAULT_HAIKU_MODEL: 'MiniMax-M2.1',
      },
    };
  }

  checkConfigured(c: Record<string, unknown>) {
    const env = c.env as Record<string, string> | undefined;
    return !!env?.ANTHROPIC_BASE_URL?.includes('minimax');
  }

  cleanConfig(c: Record<string, unknown>) {
    const env = c.env as Record<string, unknown> | undefined;
    if (!env) return;
    for (const k of ['ANTHROPIC_BASE_URL', 'ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_MODEL',
      'ANTHROPIC_SMALL_FAST_MODEL', 'ANTHROPIC_DEFAULT_SONNET_MODEL',
      'ANTHROPIC_DEFAULT_OPUS_MODEL', 'ANTHROPIC_DEFAULT_HAIKU_MODEL',
      'API_TIMEOUT_MS', 'CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC']) {
      delete env[k];
    }
  }
}
