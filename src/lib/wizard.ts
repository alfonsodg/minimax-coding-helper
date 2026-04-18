import inquirer from 'inquirer';
import chalk from 'chalk';
import { configManager, maskApiKey } from './config.js';
import { i18n } from './i18n.js';
import { toolManagers, type ToolManager } from './tools/index.js';

class Wizard {
  async runFirstTimeSetup(): Promise<void> {
    console.log(chalk.cyan('\n🚀 MiniMax M2.1 Coding Helper Setup\n'));
    await this.configLanguage();
    await this.configRegion();
    await this.configApiKey();
    const { configureTool } = await inquirer.prompt([{
      type: 'confirm', name: 'configureTool', message: i18n.t('wizard.configure_now'), default: true,
    }]);
    if (configureTool) await this.showToolMenu();
    console.log(chalk.green(`\n✓ ${i18n.t('messages.config_success')}\n`));
  }

  async showMainMenu(): Promise<void> {
    const { action } = await inquirer.prompt([{
      type: 'list', name: 'action', message: i18n.t('wizard.main_menu'),
      choices: [
        { name: `🔧 ${i18n.t('wizard.config_tool')}`, value: 'tool' },
        { name: `🌐 ${i18n.t('wizard.config_mcp')}`, value: 'mcp' },
        { name: `🗑️  ${i18n.t('wizard.uninstall')}`, value: 'uninstall' },
        new inquirer.Separator(),
        { name: `🌍 ${i18n.t('wizard.config_lang')}`, value: 'lang' },
        { name: `📍 ${i18n.t('wizard.config_region')}`, value: 'region' },
        { name: `🔑 ${i18n.t('wizard.config_api_key')}`, value: 'apikey' },
        { name: `🩺 ${i18n.t('wizard.doctor')}`, value: 'doctor' },
        new inquirer.Separator(),
        { name: `❌ ${i18n.t('wizard.exit')}`, value: 'exit' },
      ],
    }]);

    const actions: Record<string, () => Promise<void>> = {
      lang: () => this.configLanguage(), region: () => this.configRegion(),
      apikey: () => this.configApiKey(), tool: () => this.showToolMenu(),
      mcp: () => this.showMcpMenu(), uninstall: () => this.showUninstallMenu(),
      doctor: () => this.runDoctor(),
    };
    if (actions[action]) await actions[action]();
    if (action !== 'exit') await this.showMainMenu();
  }

  async showToolMenu(): Promise<void> {
    const autoKeys = ['claude-code', 'droid', 'opencode', 'continue', 'crush', 'codex', 'zed'];
    const manualKeys = ['cursor', 'cline', 'kilo-code', 'roo-code', 'trae', 'windsurf', 'grok-cli', 'aider', 'neovim'];

    const choices: unknown[] = [new inquirer.Separator(chalk.cyan('── Auto-config ──'))];
    for (const key of autoKeys) {
      const m = toolManagers[key];
      const s = m.isConfigured?.() ? chalk.green('✓') : chalk.gray('○');
      choices.push({ name: `${s} ${m.displayName}`, value: key });
    }
    choices.push(new inquirer.Separator(chalk.cyan('── Manual config ──')));
    for (const key of manualKeys) choices.push({ name: `  ${toolManagers[key].displayName}`, value: key });
    choices.push(new inquirer.Separator(), { name: chalk.gray('← Back'), value: 'back' });

    const { tool } = await inquirer.prompt([{ type: 'list', name: 'tool', message: i18n.t('messages.select_tool'), choices, pageSize: 20 }]);
    if (tool === 'back') return;

    if (autoKeys.includes(tool)) await this.configureToolWithOptions(tool);
    else { await toolManagers[tool].configure(); await inquirer.prompt([{ type: 'input', name: 'c', message: chalk.gray('Press Enter...') }]); }
    await this.showToolMenu();
  }

  async showMcpMenu(): Promise<void> {
    const mcpKeys = Object.keys(toolManagers).filter(k => k.startsWith('mcp-'));
    const choices = mcpKeys.map(k => {
      const m = toolManagers[k];
      const s = m.isConfigured?.() ? chalk.green('✓') : chalk.gray('○');
      return { name: `${s} ${m.displayName}`, value: k };
    });
    choices.push({ name: `📋 ${i18n.t('wizard.mcp_info')}`, value: 'info' } as typeof choices[0]);
    choices.push({ name: chalk.gray('← Back'), value: 'back' } as typeof choices[0]);

    const { tool } = await inquirer.prompt([{ type: 'list', name: 'tool', message: i18n.t('wizard.select_mcp'), choices, pageSize: 20 }]);
    if (tool === 'info') await toolManagers['mcp'].configure();
    else if (tool !== 'back') await this.configureToolWithOptions(tool);
    if (tool !== 'back') await this.showMcpMenu();
  }

  async configureToolWithOptions(toolKey: string): Promise<void> {
    const m = toolManagers[toolKey];
    const choices = [{ name: `⚙️  ${i18n.t('wizard.install_config')}`, value: 'install' }];
    if (m.isConfigured?.()) choices.push({ name: `🗑️  ${i18n.t('wizard.remove_config')}`, value: 'uninstall' });
    choices.push({ name: chalk.gray('← Back'), value: 'back' });

    const { action } = await inquirer.prompt([{ type: 'list', name: 'action', message: `${m.displayName}:`, choices }]);
    if (action === 'install') await m.configure();
    else if (action === 'uninstall') { await m.uninstall?.(); console.log(chalk.green(`✓ ${m.displayName} ${i18n.t('messages.uninstalled')}`)); }
  }

  async showUninstallMenu(): Promise<void> {
    const allKeys = Object.keys(toolManagers).filter(k => k !== 'mcp' && !['cursor', 'cline', 'kilo-code', 'roo-code', 'trae', 'windsurf', 'grok-cli', 'aider', 'neovim'].includes(k));
    const configured = allKeys.filter(k => toolManagers[k].isConfigured?.());
    if (!configured.length) { console.log(chalk.yellow(`\n${i18n.t('messages.no_configs')}\n`)); return; }

    const choices = configured.map(k => ({ name: toolManagers[k].displayName, value: k }));
    choices.push({ name: chalk.red(i18n.t('wizard.uninstall_all')), value: 'all' });
    choices.push({ name: chalk.gray('← Back'), value: 'back' });

    const { tool } = await inquirer.prompt([{ type: 'list', name: 'tool', message: i18n.t('wizard.select_uninstall'), choices }]);
    if (tool === 'back') return;
    if (tool === 'all') {
      const { confirm } = await inquirer.prompt([{ type: 'confirm', name: 'confirm', message: i18n.t('wizard.confirm_uninstall_all'), default: false }]);
      if (confirm) { for (const k of configured) await toolManagers[k].uninstall?.(); console.log(chalk.green(`\n✓ ${i18n.t('messages.all_uninstalled')}\n`)); }
    } else {
      await toolManagers[tool].uninstall?.();
      console.log(chalk.green(`✓ ${toolManagers[tool].displayName} ${i18n.t('messages.uninstalled')}`));
      await this.showUninstallMenu();
    }
  }

  async configLanguage(): Promise<void> {
    const { lang } = await inquirer.prompt([{
      type: 'list', name: 'lang', message: i18n.t('messages.select_lang'),
      choices: [{ name: 'English', value: 'en_US' }, { name: 'Español', value: 'es_ES' }, { name: '中文', value: 'zh_CN' }],
      default: configManager.getLang(),
    }]);
    configManager.setLang(lang);
    i18n.loadFromConfig(lang);
    console.log(chalk.green(`✓ ${i18n.t('lang.set_success')} ${lang}`));
  }

  async configRegion(): Promise<void> {
    const { region } = await inquirer.prompt([{
      type: 'list', name: 'region', message: i18n.t('messages.select_region'),
      choices: [{ name: 'Global (api.minimax.io)', value: 'global' }, { name: 'China (api.minimaxi.com)', value: 'china' }],
      default: configManager.getRegion(),
    }]);
    configManager.setRegion(region);
    console.log(chalk.green(`✓ Region: ${region}`));
  }

  async configApiKey(): Promise<void> {
    console.log(chalk.gray(`${i18n.t('messages.current')}: ${maskApiKey(configManager.getApiKey())}`));
    const { apiKey } = await inquirer.prompt([{ type: 'password', name: 'apiKey', message: i18n.t('messages.enter_api_key'), mask: '*' }]);
    if (apiKey) { configManager.setApiKey(apiKey); console.log(chalk.green(`✓ ${i18n.t('messages.api_key_saved')}`)); }
  }

  async runDoctor(): Promise<void> {
    console.log(chalk.cyan(`\n🩺 ${i18n.t('doctor.checking')}\n`));
    const config = configManager.getConfig();
    const check = (ok: boolean) => ok ? chalk.green('✓') : chalk.red('✗');

    console.log(`${check(!!config.api_key)} ${i18n.t('doctor.api_key')}: ${config.api_key ? maskApiKey(config.api_key) : i18n.t('doctor.not_configured')}`);
    console.log(`${check(true)} ${i18n.t('doctor.region')}: ${config.region || 'global'}`);
    console.log(`${check(true)} ${i18n.t('doctor.lang')}: ${config.lang}`);
    console.log(chalk.cyan(`\n📊 ${i18n.t('doctor.tools_status')}:\n`));

    let count = 0;
    for (const [key, m] of Object.entries(toolManagers)) {
      if (key === 'mcp') continue;
      if (m.isConfigured?.()) { console.log(`  ${chalk.green('✓')} ${m.displayName}`); count++; }
    }
    if (!count) console.log(chalk.gray(`  ${i18n.t('messages.no_configs')}`));
    console.log(`\n  Base URL (Anthropic): ${configManager.getBaseUrl('anthropic')}`);
    console.log(`  Base URL (OpenAI): ${configManager.getBaseUrl('openai')}\n`);
  }
}

export const wizard = new Wizard();
