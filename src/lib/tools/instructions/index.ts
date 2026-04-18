import chalk from 'chalk';
import { configManager, maskApiKey } from '../../config.js';
import type { ToolManager } from '../base.js';

class InstructionsTool implements ToolManager {
  constructor(public name: string, public displayName: string, private instructions: () => void) {}
  isInstalled(): boolean { return true; }
  isConfigured(): boolean { return false; }
  async configure(): Promise<boolean> { this.instructions(); return true; }
  async uninstall(): Promise<boolean> { return true; }
}

const masked = () => maskApiKey(configManager.getApiKey());
const baseAnthropic = () => configManager.getBaseUrl('anthropic');
const baseOpenai = () => configManager.getBaseUrl('openai');
const endpoint = () => configManager.getRegion() === 'china' ? 'api.minimaxi.com' : 'api.minimax.io';

export const instructionManagers: Record<string, ToolManager> = {
  cursor: new InstructionsTool('cursor', 'Cursor', () => {
    console.log(chalk.cyan('\n📋 Cursor Configuration:\n'));
    console.log(`1. Settings → Models → Enable "Override OpenAI Base URL"`);
    console.log(`2. Base URL: ${chalk.green(baseOpenai())}`);
    console.log(`3. API Key: ${chalk.green(masked())}`);
    console.log(`4. Add Custom Model → MiniMax-M2.1 → Enable\n`);
  }),
  cline: new InstructionsTool('cline', 'Cline', () => {
    console.log(chalk.cyan('\n📋 Cline Configuration:\n'));
    console.log(chalk.yellow('Note: MiniMax-M2.1 Coming Soon, use MiniMax-M2\n'));
    console.log(`1. API Provider: MiniMax`);
    console.log(`2. Entrypoint: ${chalk.green(endpoint())}`);
    console.log(`3. API Key: ${chalk.green(masked())}`);
    console.log(`4. Model: MiniMax-M2\n`);
  }),
  'kilo-code': new InstructionsTool('kilo-code', 'Kilo Code', () => {
    console.log(chalk.cyan('\n📋 Kilo Code Configuration:\n'));
    console.log(`1. Settings → API Provider: MiniMax`);
    console.log(`2. Entrypoint: ${chalk.green(endpoint())}`);
    console.log(`3. API Key: ${chalk.green(masked())}`);
    console.log(`4. Model: MiniMax-M2.1\n`);
  }),
  'roo-code': new InstructionsTool('roo-code', 'Roo Code', () => {
    console.log(chalk.cyan('\n📋 Roo Code Configuration:\n'));
    console.log(`1. Settings → API Provider: MiniMax`);
    console.log(`2. Entrypoint: ${chalk.green(endpoint())}`);
    console.log(`3. API Key: ${chalk.green(masked())}`);
    console.log(`4. Model: MiniMax-M2.1\n`);
  }),
  trae: new InstructionsTool('trae', 'TRAE', () => {
    console.log(chalk.cyan('\n📋 TRAE Configuration:\n'));
    console.log(`1. Settings → Models → "+ Add Model"`);
    console.log(`2. Model ID: MiniMax M2.1`);
    console.log(`3. API Key: ${chalk.green(masked())}\n`);
  }),
  windsurf: new InstructionsTool('windsurf', 'Windsurf', () => {
    console.log(chalk.cyan('\n📋 Windsurf Configuration:\n'));
    console.log(`1. Settings → AI Provider → Custom OpenAI-compatible`);
    console.log(`2. Base URL: ${chalk.green(baseOpenai())}`);
    console.log(`3. API Key: ${chalk.green(masked())}`);
    console.log(`4. Model: MiniMax-M2.1\n`);
  }),
  'grok-cli': new InstructionsTool('grok-cli', 'Grok CLI', () => {
    console.log(chalk.cyan('\n📋 Grok CLI Configuration:\n'));
    console.log(chalk.yellow('Note: Not Recommended by MiniMax\n'));
    console.log(chalk.green(`export GROK_BASE_URL="${baseOpenai()}"`));
    console.log(chalk.green(`export GROK_API_KEY="<your-key>"`));
    console.log(chalk.yellow('\ngrok --model MiniMax-M2.1\n'));
  }),
  aider: new InstructionsTool('aider', 'Aider', () => {
    console.log(chalk.cyan('\n📋 Aider Configuration:\n'));
    console.log(chalk.green(`export OPENAI_API_BASE="${baseOpenai()}"`));
    console.log(chalk.green(`export OPENAI_API_KEY="<your-key>"`));
    console.log(chalk.yellow('\naider --model openai/MiniMax-M2.1\n'));
  }),
  neovim: new InstructionsTool('neovim', 'Neovim', () => {
    console.log(chalk.cyan('\n📋 Neovim (avante.nvim) Configuration:\n'));
    console.log(chalk.green(`export OPENAI_API_KEY="<your-key>"`));
    console.log(chalk.gray(`\nrequire('avante').setup({\n  provider = "openai",\n  openai = { endpoint = "${baseOpenai()}", model = "MiniMax-M2.1" }\n})\n`));
  }),
  mcp: new InstructionsTool('mcp', 'MCP Info', () => {
    const host = configManager.getRegion() === 'china' ? 'https://api.minimaxi.com' : 'https://api.minimax.io';
    console.log(chalk.cyan('\n📋 MiniMax MCP Server Configuration:\n'));
    console.log(chalk.yellow('Install uvx: curl -LsSf https://astral.sh/uv/install.sh | sh\n'));
    console.log(chalk.gray(JSON.stringify({
      mcpServers: { MiniMax: { command: 'uvx', args: ['minimax-coding-plan-mcp'], env: { MINIMAX_API_KEY: '<your-key>', MINIMAX_API_HOST: host } } }
    }, null, 2)));
    console.log(chalk.yellow('\nTools: web_search, understand_image\n'));
  }),
};
