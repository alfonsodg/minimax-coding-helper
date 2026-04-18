import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { configManager } from '../../config.js';
import { i18n } from '../../i18n.js';
import type { ToolManager } from '../base.js';
import { readJsonSafe, writeJsonSafe } from '../base.js';

type McpFormat = 'mcpServers' | 'context_servers' | 'chat.mcp.servers' | 'mcp';

const MCP_ARGS = ['minimax-coding-plan-mcp'];

function getMcpEntry(format: McpFormat) {
  const host = configManager.getRegion() === 'china' ? 'https://api.minimaxi.com' : 'https://api.minimax.io';
  const env = { MINIMAX_API_KEY: configManager.getApiKey()!, MINIMAX_API_HOST: host };
  if (format === 'context_servers') return { source: 'custom', enabled: true, command: 'uvx', args: MCP_ARGS, env };
  if (format === 'mcp') return { type: 'stdio', command: 'uvx', args: MCP_ARGS, env };
  return { command: 'uvx', args: MCP_ARGS, env };
}

export function createMcpManager(name: string, displayName: string, configPath: string, format: McpFormat = 'mcpServers'): ToolManager {
  const key = format === 'chat.mcp.servers' ? 'chat.mcp.servers' : format;

  return {
    name, displayName,
    isInstalled: () => true,
    isConfigured: () => {
      if (!existsSync(configPath)) return false;
      const c = readJsonSafe(configPath);
      return !!(c[key] as Record<string, unknown> | undefined)?.MiniMax;
    },
    configure: async () => {
      if (!configManager.getApiKey()) { console.log(chalk.red(i18n.t('messages.no_api_key'))); return false; }
      mkdirSync(join(configPath, '..'), { recursive: true });
      const existing = readJsonSafe(configPath);
      const section = (existing[key] as Record<string, unknown>) ?? {};
      section.MiniMax = getMcpEntry(format);
      existing[key] = section;
      if (!writeJsonSafe(configPath, existing)) return false;
      console.log(chalk.green(`✓ ${displayName} ${i18n.t('messages.config_success')}`));
      console.log(chalk.yellow('  Tools: web_search, understand_image'));
      return true;
    },
    uninstall: async () => {
      if (!existsSync(configPath)) return true;
      const c = readJsonSafe(configPath);
      delete (c[key] as Record<string, unknown> | undefined)?.MiniMax;
      return writeJsonSafe(configPath, c);
    },
  };
}
