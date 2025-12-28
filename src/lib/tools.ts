import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { configManager } from './config.js';
import { i18n } from './i18n.js';
import chalk from 'chalk';

export interface ToolManager {
  name: string;
  displayName: string;
  configure(): Promise<boolean>;
  uninstall?(): Promise<boolean>;
  isInstalled(): boolean;
  isConfigured?(): boolean;
}

// Base class for JSON config tools
abstract class JsonConfigTool implements ToolManager {
  abstract name: string;
  abstract displayName: string;
  abstract configPath: string;
  abstract configKey: string;

  abstract getConfig(): Record<string, unknown>;

  isInstalled(): boolean { return true; }

  isConfigured(): boolean {
    if (!existsSync(this.configPath)) return false;
    try {
      const content = JSON.parse(readFileSync(this.configPath, 'utf-8'));
      return !!content[this.configKey] || !!content.env?.ANTHROPIC_BASE_URL?.includes('minimax');
    } catch { return false; }
  }

  async configure(): Promise<boolean> {
    const apiKey = configManager.getApiKey();
    if (!apiKey) {
      console.log(chalk.red(i18n.t('messages.no_api_key')));
      return false;
    }

    const dir = join(this.configPath, '..');
    mkdirSync(dir, { recursive: true });

    let existing: Record<string, unknown> = {};
    if (existsSync(this.configPath)) {
      try { existing = JSON.parse(readFileSync(this.configPath, 'utf-8')); } catch { /* ignore */ }
    }

    const merged = { ...existing, ...this.getConfig() };
    writeFileSync(this.configPath, JSON.stringify(merged, null, 2));
    console.log(chalk.green(`✓ ${this.displayName} ${i18n.t('messages.config_success')}`));
    return true;
  }

  async uninstall(): Promise<boolean> {
    if (!existsSync(this.configPath)) return true;
    try {
      const content = JSON.parse(readFileSync(this.configPath, 'utf-8'));
      // Remove MiniMax specific config
      if (content.env) {
        delete content.env.ANTHROPIC_BASE_URL;
        delete content.env.ANTHROPIC_AUTH_TOKEN;
        delete content.env.ANTHROPIC_MODEL;
        delete content.env.OPENAI_BASE_URL;
        delete content.env.OPENAI_API_KEY;
      }
      if (content.mcpServers?.MiniMax) {
        delete content.mcpServers.MiniMax;
      }
      if (content.custom_models) {
        content.custom_models = content.custom_models.filter((m: any) => !m.model?.includes('MiniMax'));
      }
      writeFileSync(this.configPath, JSON.stringify(content, null, 2));
    } catch { /* ignore */ }
    return true;
  }
}

// Claude Code: ~/.claude/settings.json
class ClaudeCodeManager extends JsonConfigTool {
  name = 'claude-code';
  displayName = 'Claude Code';
  configPath = join(homedir(), '.claude', 'settings.json');
  configKey = 'env';

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
        ANTHROPIC_DEFAULT_HAIKU_MODEL: 'MiniMax-M2.1'
      }
    };
  }
}

// Droid: ~/.factory/config.json
class DroidManager extends JsonConfigTool {
  name = 'droid';
  displayName = 'Droid';
  configPath = join(homedir(), '.factory', 'config.json');
  configKey = 'custom_models';

  isConfigured(): boolean {
    if (!existsSync(this.configPath)) return false;
    try {
      const content = JSON.parse(readFileSync(this.configPath, 'utf-8'));
      return content.custom_models?.some((m: any) => m.model?.includes('MiniMax'));
    } catch { return false; }
  }

  getConfig() {
    return {
      custom_models: [{
        model_display_name: 'MiniMax-M2.1',
        model: 'MiniMax-M2.1',
        base_url: configManager.getBaseUrl('anthropic'),
        api_key: configManager.getApiKey(),
        provider: 'anthropic',
        max_tokens: 64000
      }]
    };
  }
}

// OpenCode: ~/.config/opencode/opencode.json
class OpenCodeManager extends JsonConfigTool {
  name = 'opencode';
  displayName = 'OpenCode';
  configPath = join(homedir(), '.config', 'opencode', 'opencode.json');
  configKey = 'provider';

  isConfigured(): boolean {
    if (!existsSync(this.configPath)) return false;
    try {
      const content = JSON.parse(readFileSync(this.configPath, 'utf-8'));
      return !!content.provider?.minimax;
    } catch { return false; }
  }

  getConfig() {
    return {
      $schema: 'https://opencode.ai/config.json',
      provider: {
        minimax: {
          npm: '@ai-sdk/anthropic',
          options: {
            baseURL: `${configManager.getBaseUrl('anthropic')}/v1`,
            apiKey: configManager.getApiKey()
          },
          models: { 'MiniMax-M2.1': { name: 'MiniMax-M2.1' } }
        }
      }
    };
  }

  async uninstall(): Promise<boolean> {
    if (!existsSync(this.configPath)) return true;
    try {
      const content = JSON.parse(readFileSync(this.configPath, 'utf-8'));
      delete content.provider?.minimax;
      writeFileSync(this.configPath, JSON.stringify(content, null, 2));
    } catch { /* ignore */ }
    return true;
  }
}

// Continue: ~/.continue/config.json
class ContinueManager extends JsonConfigTool {
  name = 'continue';
  displayName = 'Continue';
  configPath = join(homedir(), '.continue', 'config.json');
  configKey = 'models';

  isConfigured(): boolean {
    if (!existsSync(this.configPath)) return false;
    try {
      const content = JSON.parse(readFileSync(this.configPath, 'utf-8'));
      return content.models?.some((m: any) => m.title?.includes('MiniMax'));
    } catch { return false; }
  }

  getConfig() {
    return {
      models: [{
        title: 'MiniMax-M2.1',
        provider: 'openai',
        model: 'MiniMax-M2.1',
        apiBase: configManager.getBaseUrl('openai'),
        apiKey: configManager.getApiKey()
      }]
    };
  }

  async configure(): Promise<boolean> {
    const apiKey = configManager.getApiKey();
    if (!apiKey) {
      console.log(chalk.red(i18n.t('messages.no_api_key')));
      return false;
    }

    mkdirSync(join(homedir(), '.continue'), { recursive: true });
    
    let existing: Record<string, unknown> = {};
    if (existsSync(this.configPath)) {
      try { existing = JSON.parse(readFileSync(this.configPath, 'utf-8')); } catch { /* ignore */ }
    }

    const models = Array.isArray(existing.models) ? existing.models.filter((m: any) => !m.title?.includes('MiniMax')) : [];
    existing.models = [...models, ...this.getConfig().models];
    
    writeFileSync(this.configPath, JSON.stringify(existing, null, 2));
    console.log(chalk.green(`✓ ${this.displayName} ${i18n.t('messages.config_success')}`));
    return true;
  }

  async uninstall(): Promise<boolean> {
    if (!existsSync(this.configPath)) return true;
    try {
      const content = JSON.parse(readFileSync(this.configPath, 'utf-8'));
      content.models = content.models?.filter((m: any) => !m.title?.includes('MiniMax')) || [];
      writeFileSync(this.configPath, JSON.stringify(content, null, 2));
    } catch { /* ignore */ }
    return true;
  }
}

// Crush: ~/.config/crush/crush.json
class CrushManager extends JsonConfigTool {
  name = 'crush';
  displayName = 'Crush';
  configPath = join(homedir(), '.config', 'crush', 'crush.json');
  configKey = 'providers';

  isConfigured(): boolean {
    if (!existsSync(this.configPath)) return false;
    try {
      const content = JSON.parse(readFileSync(this.configPath, 'utf-8'));
      return !!content.providers?.minimax;
    } catch { return false; }
  }

  getConfig() {
    return {
      providers: {
        minimax: {
          type: 'openai-compat',
          base_url: configManager.getBaseUrl('openai'),
          api_key: '$MINIMAX_API_KEY',
          models: [{
            id: 'MiniMax-M2.1',
            name: 'MiniMax M2.1',
            context_window: 200000,
            default_max_tokens: 64000
          }]
        }
      }
    };
  }

  async configure(): Promise<boolean> {
    const result = await super.configure();
    if (result) {
      console.log(chalk.yellow(`  export MINIMAX_API_KEY="${configManager.getApiKey()}"`));
    }
    return result;
  }

  async uninstall(): Promise<boolean> {
    if (!existsSync(this.configPath)) return true;
    try {
      const content = JSON.parse(readFileSync(this.configPath, 'utf-8'));
      delete content.providers?.minimax;
      writeFileSync(this.configPath, JSON.stringify(content, null, 2));
    } catch { /* ignore */ }
    return true;
  }
}

// Codex CLI: ~/.codex/config.toml
class CodexManager implements ToolManager {
  name = 'codex';
  displayName = 'Codex CLI';
  private configPath = join(homedir(), '.codex', 'config.toml');

  isInstalled(): boolean { return true; }
  
  isConfigured(): boolean {
    if (!existsSync(this.configPath)) return false;
    try {
      return readFileSync(this.configPath, 'utf-8').includes('minimax');
    } catch { return false; }
  }

  async configure(): Promise<boolean> {
    const existing = existsSync(this.configPath) ? readFileSync(this.configPath, 'utf-8') : '';
    const config = `
[model_providers.minimax]
name = "MiniMax Chat Completions API"
base_url = "${configManager.getBaseUrl('openai')}"
env_key = "MINIMAX_API_KEY"
wire_api = "chat"
requires_openai_auth = false

[profiles.m21]
model = "codex-MiniMax-M2.1"
model_provider = "minimax"
`;
    mkdirSync(join(homedir(), '.codex'), { recursive: true });
    writeFileSync(this.configPath, existing.includes('[model_providers.minimax]') ? existing : existing + config);
    
    console.log(chalk.green(`✓ ${this.displayName} ${i18n.t('messages.config_success')}`));
    console.log(chalk.yellow(`  export MINIMAX_API_KEY="${configManager.getApiKey()}"`));
    console.log(chalk.yellow(`  codex --profile m21`));
    return true;
  }

  async uninstall(): Promise<boolean> {
    if (!existsSync(this.configPath)) return true;
    try {
      let content = readFileSync(this.configPath, 'utf-8');
      // Remove minimax sections
      content = content.replace(/\[model_providers\.minimax\][\s\S]*?(?=\[|$)/g, '');
      content = content.replace(/\[profiles\.m21\][\s\S]*?(?=\[|$)/g, '');
      writeFileSync(this.configPath, content.trim());
    } catch { /* ignore */ }
    return true;
  }
}

// Zed: ~/.config/zed/settings.json
class ZedManager extends JsonConfigTool {
  name = 'zed';
  displayName = 'Zed';
  configPath = join(homedir(), '.config', 'zed', 'settings.json');
  configKey = 'language_models';

  isConfigured(): boolean {
    if (!existsSync(this.configPath)) return false;
    try {
      const content = JSON.parse(readFileSync(this.configPath, 'utf-8'));
      return content.language_models?.openai?.api_url?.includes('minimax');
    } catch { return false; }
  }

  getConfig() {
    return {
      language_models: {
        openai: {
          api_url: configManager.getBaseUrl('openai'),
          available_models: [{ name: 'MiniMax-M2.1', max_tokens: 64000 }]
        }
      },
      assistant: {
        default_model: { provider: 'openai', model: 'MiniMax-M2.1' }
      }
    };
  }

  async configure(): Promise<boolean> {
    const result = await super.configure();
    if (result) {
      console.log(chalk.yellow(`  export OPENAI_API_KEY="${configManager.getApiKey()}"`));
    }
    return result;
  }

  async uninstall(): Promise<boolean> {
    if (!existsSync(this.configPath)) return true;
    try {
      const content = JSON.parse(readFileSync(this.configPath, 'utf-8'));
      if (content.language_models?.openai?.api_url?.includes('minimax')) {
        delete content.language_models;
        delete content.assistant;
      }
      writeFileSync(this.configPath, JSON.stringify(content, null, 2));
    } catch { /* ignore */ }
    return true;
  }
}

// MCP for Claude Code: ~/.claude.json
class McpClaudeCodeManager extends JsonConfigTool {
  name = 'mcp-claude-code';
  displayName = 'MCP (Claude Code)';
  configPath = join(homedir(), '.claude.json');
  configKey = 'mcpServers';

  isConfigured(): boolean {
    if (!existsSync(this.configPath)) return false;
    try {
      const content = JSON.parse(readFileSync(this.configPath, 'utf-8'));
      return !!content.mcpServers?.MiniMax;
    } catch { return false; }
  }

  getConfig() {
    const host = configManager.getRegion() === 'china' ? 'https://api.minimaxi.com' : 'https://api.minimax.io';
    return {
      mcpServers: {
        MiniMax: {
          command: 'uvx',
          args: ['minimax-coding-plan-mcp', '-y'],
          env: { MINIMAX_API_KEY: configManager.getApiKey(), MINIMAX_API_HOST: host }
        }
      }
    };
  }

  async configure(): Promise<boolean> {
    const result = await super.configure();
    if (result) {
      console.log(chalk.yellow('  Tools: web_search, understand_image'));
    }
    return result;
  }
}

// MCP for Cursor: ~/.cursor/mcp.json
class McpCursorManager extends JsonConfigTool {
  name = 'mcp-cursor';
  displayName = 'MCP (Cursor)';
  configPath = join(homedir(), '.cursor', 'mcp.json');
  configKey = 'mcpServers';

  isConfigured(): boolean {
    if (!existsSync(this.configPath)) return false;
    try {
      const content = JSON.parse(readFileSync(this.configPath, 'utf-8'));
      return !!content.mcpServers?.MiniMax;
    } catch { return false; }
  }

  getConfig() {
    const host = configManager.getRegion() === 'china' ? 'https://api.minimaxi.com' : 'https://api.minimax.io';
    return {
      mcpServers: {
        MiniMax: {
          command: 'uvx',
          args: ['minimax-coding-plan-mcp'],
          env: { MINIMAX_API_KEY: configManager.getApiKey(), MINIMAX_API_HOST: host }
        }
      }
    };
  }

  async configure(): Promise<boolean> {
    const result = await super.configure();
    if (result) {
      console.log(chalk.yellow('  Tools: web_search, understand_image'));
    }
    return result;
  }
}

// Generic MCP manager factory for standard JSON format
function createStandardMcpManager(name: string, displayName: string, configPath: string): ToolManager {
  return {
    name, displayName,
    isInstalled: () => true,
    isConfigured: () => {
      if (!existsSync(configPath)) return false;
      try { return !!JSON.parse(readFileSync(configPath, 'utf-8')).mcpServers?.MiniMax; } catch { return false; }
    },
    configure: async () => {
      const apiKey = configManager.getApiKey();
      if (!apiKey) { console.log(chalk.red(i18n.t('messages.no_api_key'))); return false; }
      const host = configManager.getRegion() === 'china' ? 'https://api.minimaxi.com' : 'https://api.minimax.io';
      mkdirSync(join(configPath, '..'), { recursive: true });
      let existing: Record<string, unknown> = {};
      if (existsSync(configPath)) { try { existing = JSON.parse(readFileSync(configPath, 'utf-8')); } catch {} }
      existing.mcpServers = { ...(existing.mcpServers as Record<string, unknown> || {}), MiniMax: { command: 'uvx', args: ['minimax-coding-plan-mcp'], env: { MINIMAX_API_KEY: apiKey, MINIMAX_API_HOST: host } } };
      writeFileSync(configPath, JSON.stringify(existing, null, 2));
      console.log(chalk.green(`✓ ${displayName} ${i18n.t('messages.config_success')}`));
      console.log(chalk.yellow('  Tools: web_search, understand_image'));
      return true;
    },
    uninstall: async () => {
      if (!existsSync(configPath)) return true;
      try { const c = JSON.parse(readFileSync(configPath, 'utf-8')); delete c.mcpServers?.MiniMax; writeFileSync(configPath, JSON.stringify(c, null, 2)); } catch {}
      return true;
    }
  };
}

// MCP for Zed (uses context_servers)
const mcpZedManager: ToolManager = {
  name: 'mcp-zed', displayName: 'MCP (Zed)',
  isInstalled: () => true,
  isConfigured: () => { try { return !!JSON.parse(readFileSync(join(homedir(), '.config', 'zed', 'settings.json'), 'utf-8')).context_servers?.MiniMax; } catch { return false; } },
  configure: async () => {
    const apiKey = configManager.getApiKey();
    if (!apiKey) { console.log(chalk.red(i18n.t('messages.no_api_key'))); return false; }
    const configPath = join(homedir(), '.config', 'zed', 'settings.json');
    const host = configManager.getRegion() === 'china' ? 'https://api.minimaxi.com' : 'https://api.minimax.io';
    mkdirSync(join(homedir(), '.config', 'zed'), { recursive: true });
    let existing: Record<string, unknown> = {};
    if (existsSync(configPath)) { try { existing = JSON.parse(readFileSync(configPath, 'utf-8')); } catch {} }
    existing.context_servers = { ...(existing.context_servers as Record<string, unknown> || {}), MiniMax: { source: 'custom', enabled: true, command: 'uvx', args: ['minimax-coding-plan-mcp'], env: { MINIMAX_API_KEY: apiKey, MINIMAX_API_HOST: host } } };
    writeFileSync(configPath, JSON.stringify(existing, null, 2));
    console.log(chalk.green(`✓ MCP (Zed) ${i18n.t('messages.config_success')}`));
    console.log(chalk.yellow('  Tools: web_search, understand_image'));
    return true;
  },
  uninstall: async () => { try { const p = join(homedir(), '.config', 'zed', 'settings.json'); const c = JSON.parse(readFileSync(p, 'utf-8')); delete c.context_servers?.MiniMax; writeFileSync(p, JSON.stringify(c, null, 2)); } catch {} return true; }
};

// MCP for VS Code (uses chat.mcp.servers)
const mcpVSCodeManager: ToolManager = {
  name: 'mcp-vscode', displayName: 'MCP (VS Code)',
  isInstalled: () => true,
  isConfigured: () => { try { return !!JSON.parse(readFileSync(join(homedir(), '.config', 'Code', 'User', 'settings.json'), 'utf-8'))['chat.mcp.servers']?.MiniMax; } catch { return false; } },
  configure: async () => {
    const apiKey = configManager.getApiKey();
    if (!apiKey) { console.log(chalk.red(i18n.t('messages.no_api_key'))); return false; }
    const configPath = join(homedir(), '.config', 'Code', 'User', 'settings.json');
    const host = configManager.getRegion() === 'china' ? 'https://api.minimaxi.com' : 'https://api.minimax.io';
    mkdirSync(join(homedir(), '.config', 'Code', 'User'), { recursive: true });
    let existing: Record<string, unknown> = {};
    if (existsSync(configPath)) { try { existing = JSON.parse(readFileSync(configPath, 'utf-8')); } catch {} }
    existing['chat.mcp.servers'] = { ...(existing['chat.mcp.servers'] as Record<string, unknown> || {}), MiniMax: { command: 'uvx', args: ['minimax-coding-plan-mcp'], env: { MINIMAX_API_KEY: apiKey, MINIMAX_API_HOST: host } } };
    writeFileSync(configPath, JSON.stringify(existing, null, 2));
    console.log(chalk.green(`✓ MCP (VS Code) ${i18n.t('messages.config_success')}`));
    console.log(chalk.yellow('  Tools: web_search, understand_image'));
    return true;
  },
  uninstall: async () => { try { const p = join(homedir(), '.config', 'Code', 'User', 'settings.json'); const c = JSON.parse(readFileSync(p, 'utf-8')); delete c['chat.mcp.servers']?.MiniMax; writeFileSync(p, JSON.stringify(c, null, 2)); } catch {} return true; }
};

// MCP for Crush (uses mcp with type: stdio)
const mcpCrushManager: ToolManager = {
  name: 'mcp-crush', displayName: 'MCP (Crush)',
  isInstalled: () => true,
  isConfigured: () => { try { return !!JSON.parse(readFileSync(join(homedir(), '.config', 'crush', 'crush.json'), 'utf-8')).mcp?.MiniMax; } catch { return false; } },
  configure: async () => {
    const apiKey = configManager.getApiKey();
    if (!apiKey) { console.log(chalk.red(i18n.t('messages.no_api_key'))); return false; }
    const configPath = join(homedir(), '.config', 'crush', 'crush.json');
    const host = configManager.getRegion() === 'china' ? 'https://api.minimaxi.com' : 'https://api.minimax.io';
    mkdirSync(join(homedir(), '.config', 'crush'), { recursive: true });
    let existing: Record<string, unknown> = {};
    if (existsSync(configPath)) { try { existing = JSON.parse(readFileSync(configPath, 'utf-8')); } catch {} }
    existing.mcp = { ...(existing.mcp as Record<string, unknown> || {}), MiniMax: { type: 'stdio', command: 'uvx', args: ['minimax-coding-plan-mcp'], env: { MINIMAX_API_KEY: apiKey, MINIMAX_API_HOST: host } } };
    writeFileSync(configPath, JSON.stringify(existing, null, 2));
    console.log(chalk.green(`✓ MCP (Crush) ${i18n.t('messages.config_success')}`));
    console.log(chalk.yellow('  Tools: web_search, understand_image'));
    return true;
  },
  uninstall: async () => { try { const p = join(homedir(), '.config', 'crush', 'crush.json'); const c = JSON.parse(readFileSync(p, 'utf-8')); delete c.mcp?.MiniMax; writeFileSync(p, JSON.stringify(c, null, 2)); } catch {} return true; }
};

// Instructions-only tools
class InstructionsTool implements ToolManager {
  constructor(
    public name: string,
    public displayName: string,
    private instructions: () => void
  ) {}

  isInstalled(): boolean { return true; }
  isConfigured(): boolean { return false; }

  async configure(): Promise<boolean> {
    this.instructions();
    return true;
  }

  async uninstall(): Promise<boolean> { return true; }
}

const cursorInstructions = () => {
  const apiKey = configManager.getApiKey();
  console.log(chalk.cyan('\n📋 Cursor Configuration:\n'));
  console.log('1. Settings → Models');
  console.log('2. Enable "Override OpenAI Base URL"');
  console.log(`3. Base URL: ${chalk.green(configManager.getBaseUrl('openai'))}`);
  console.log(`4. OpenAI API Key: ${chalk.green(apiKey || '<YOUR_MINIMAX_API_KEY>')}`);
  console.log('5. Click "Enable OpenAI API Key" to verify');
  console.log('6. View All Models → Add Custom Model → MiniMax-M2.1');
  console.log('7. Enable MiniMax-M2.1 and select it\n');
};

const clineInstructions = () => {
  const apiKey = configManager.getApiKey();
  const endpoint = configManager.getRegion() === 'china' ? 'api.minimaxi.com' : 'api.minimax.io';
  console.log(chalk.cyan('\n📋 Cline Configuration:\n'));
  console.log(chalk.yellow('Note: MiniMax-M2.1 Coming Soon for Cline, use MiniMax-M2\n'));
  console.log('1. Click "Use your own API key"');
  console.log('2. API Provider: MiniMax');
  console.log(`3. MiniMax Entrypoint: ${chalk.green(endpoint)}`);
  console.log(`4. MiniMax API Key: ${chalk.green(apiKey || '<YOUR_MINIMAX_API_KEY>')}`);
  console.log('5. Model: MiniMax-M2');
  console.log('6. Click "Let\'s go!" then "Done"\n');
};

const kiloCodeInstructions = () => {
  const apiKey = configManager.getApiKey();
  const endpoint = configManager.getRegion() === 'china' ? 'api.minimaxi.com' : 'api.minimax.io';
  console.log(chalk.cyan('\n📋 Kilo Code Configuration:\n'));
  console.log('1. Click Settings');
  console.log('2. API Provider: MiniMax');
  console.log(`3. MiniMax Entrypoint: ${chalk.green(endpoint)}`);
  console.log(`4. MiniMax API Key: ${chalk.green(apiKey || '<YOUR_MINIMAX_API_KEY>')}`);
  console.log('5. Model: MiniMax-M2.1');
  console.log('6. Click "Save" then "Done"\n');
};

const rooCodeInstructions = () => {
  const apiKey = configManager.getApiKey();
  const endpoint = configManager.getRegion() === 'china' ? 'api.minimaxi.com' : 'api.minimax.io';
  console.log(chalk.cyan('\n📋 Roo Code Configuration:\n'));
  console.log('1. Click Settings');
  console.log('2. API Provider: MiniMax');
  console.log(`3. MiniMax Entrypoint: ${chalk.green(endpoint)}`);
  console.log(`4. MiniMax API Key: ${chalk.green(apiKey || '<YOUR_MINIMAX_API_KEY>')}`);
  console.log('5. Model: MiniMax-M2.1');
  console.log('6. Click "Save" then "Done"\n');
};

const traeInstructions = () => {
  const apiKey = configManager.getApiKey();
  console.log(chalk.cyan('\n📋 TRAE Configuration:\n'));
  console.log('1. Settings icon (top right) → Models');
  console.log('2. Click "+ Add Model"');
  console.log('3. Provider: OpenRouter or SiliconFlow');
  console.log('4. Model: Select "other models"');
  console.log('5. Model ID: MiniMax M2.1');
  console.log(`6. API Key: ${chalk.green(apiKey || '<YOUR_MINIMAX_API_KEY>')}`);
  console.log('7. Click "Add Model"\n');
};

const windsurfInstructions = () => {
  console.log(chalk.cyan('\n📋 Windsurf Configuration:\n'));
  console.log('1. Settings → AI Provider → Custom OpenAI-compatible');
  console.log(`2. Base URL: ${chalk.green(configManager.getBaseUrl('openai'))}`);
  console.log(`3. API Key: ${chalk.green(configManager.getApiKey() || '<YOUR_MINIMAX_API_KEY>')}`);
  console.log('4. Model: MiniMax-M2.1\n');
};

const aiderInstructions = () => {
  console.log(chalk.cyan('\n📋 Aider Configuration:\n'));
  console.log(chalk.green(`export OPENAI_API_BASE="${configManager.getBaseUrl('openai')}"`));
  console.log(chalk.green(`export OPENAI_API_KEY="${configManager.getApiKey() || '<YOUR_MINIMAX_API_KEY>'}"`));
  console.log(chalk.yellow('\naider --model openai/MiniMax-M2.1\n'));
};

const grokCliInstructions = () => {
  console.log(chalk.cyan('\n📋 Grok CLI Configuration:\n'));
  console.log(chalk.yellow('Note: Not Recommended by MiniMax\n'));
  console.log('Set environment variables:');
  console.log(chalk.green(`export GROK_BASE_URL="${configManager.getBaseUrl('openai')}"`));
  console.log(chalk.green(`export GROK_API_KEY="${configManager.getApiKey() || '<YOUR_MINIMAX_API_KEY>'}"`));
  console.log('\nRun:');
  console.log(chalk.yellow('grok --model MiniMax-M2.1\n'));
};

const neovimInstructions = () => {
  console.log(chalk.cyan('\n📋 Neovim (avante.nvim) Configuration:\n'));
  console.log(chalk.green(`export OPENAI_API_KEY="${configManager.getApiKey() || '<YOUR_KEY>'}"`));
  console.log(chalk.gray(`\nrequire('avante').setup({
  provider = "openai",
  openai = { endpoint = "${configManager.getBaseUrl('openai')}", model = "MiniMax-M2.1" }
})\n`));
};

const mcpInfoInstructions = () => {
  const host = configManager.getRegion() === 'china' ? 'https://api.minimaxi.com' : 'https://api.minimax.io';
  console.log(chalk.cyan('\n📋 MiniMax MCP Server Configuration:\n'));
  console.log(chalk.yellow('Install uvx: curl -LsSf https://astral.sh/uv/install.sh | sh\n'));
  console.log(chalk.gray(JSON.stringify({
    mcpServers: { MiniMax: { command: 'uvx', args: ['minimax-coding-plan-mcp'], env: { MINIMAX_API_KEY: configManager.getApiKey() || '<KEY>', MINIMAX_API_HOST: host } } }
  }, null, 2)));
  console.log(chalk.yellow('\nTools: web_search, understand_image\n'));
};

export const toolManagers: Record<string, ToolManager> = {
  'claude-code': new ClaudeCodeManager(),
  'droid': new DroidManager(),
  'opencode': new OpenCodeManager(),
  'continue': new ContinueManager(),
  'crush': new CrushManager(),
  'codex': new CodexManager(),
  'zed': new ZedManager(),
  'cursor': new InstructionsTool('cursor', 'Cursor', cursorInstructions),
  'cline': new InstructionsTool('cline', 'Cline', clineInstructions),
  'kilo-code': new InstructionsTool('kilo-code', 'Kilo Code', kiloCodeInstructions),
  'roo-code': new InstructionsTool('roo-code', 'Roo Code', rooCodeInstructions),
  'trae': new InstructionsTool('trae', 'TRAE', traeInstructions),
  'windsurf': new InstructionsTool('windsurf', 'Windsurf', windsurfInstructions),
  'grok-cli': new InstructionsTool('grok-cli', 'Grok CLI', grokCliInstructions),
  'aider': new InstructionsTool('aider', 'Aider', aiderInstructions),
  'neovim': new InstructionsTool('neovim', 'Neovim', neovimInstructions),
  'mcp': new InstructionsTool('mcp', 'MCP Info', mcpInfoInstructions),
  'mcp-claude-code': new McpClaudeCodeManager(),
  'mcp-cursor': new McpCursorManager(),
  'mcp-kiro': createStandardMcpManager('mcp-kiro', 'MCP (Kiro)', join(homedir(), '.kiro', 'settings', 'mcp.json')),
  'mcp-amazonq': createStandardMcpManager('mcp-amazonq', 'MCP (Amazon Q)', join(homedir(), '.aws', 'amazonq', 'mcp.json')),
  'mcp-droid': createStandardMcpManager('mcp-droid', 'MCP (Droid)', join(homedir(), '.factory', 'mcp.json')),
  'mcp-grok': createStandardMcpManager('mcp-grok', 'MCP (Grok)', join(homedir(), '.grok', 'mcp.json')),
  'mcp-copilot': createStandardMcpManager('mcp-copilot', 'MCP (Copilot CLI)', join(homedir(), '.copilot', 'mcp-config.json')),
  'mcp-kilocode': createStandardMcpManager('mcp-kilocode', 'MCP (Kilocode)', join(homedir(), '.kilocode', 'mcp.json')),
  'mcp-gemini': createStandardMcpManager('mcp-gemini', 'MCP (Gemini)', join(homedir(), '.gemini', 'antigravity', 'mcp_config.json')),
  'mcp-warp': createStandardMcpManager('mcp-warp', 'MCP (Warp)', join(homedir(), '.config', 'warp', 'mcp.json')),
  'mcp-claude-desktop': createStandardMcpManager('mcp-claude-desktop', 'MCP (Claude Desktop)', join(homedir(), '.config', 'Claude', 'claude_desktop_config.json')),
  'mcp-zed': mcpZedManager,
  'mcp-vscode': mcpVSCodeManager,
  'mcp-crush': mcpCrushManager,
};
