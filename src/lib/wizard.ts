import inquirer from 'inquirer';
import chalk from 'chalk';
import { configManager } from './config.js';
import { i18n } from './i18n.js';
import { toolManagers, ToolManager } from './tools.js';

class Wizard {
  async runFirstTimeSetup(): Promise<void> {
    console.log(chalk.cyan('\n🚀 MiniMax M2.1 Coding Helper Setup\n'));
    
    await this.configLanguage();
    await this.configRegion();
    await this.configApiKey();
    
    const { configureTool } = await inquirer.prompt([{
      type: 'confirm',
      name: 'configureTool',
      message: i18n.t('wizard.configure_now'),
      default: true
    }]);

    if (configureTool) {
      await this.showToolMenu();
    }

    console.log(chalk.green(`\n✓ ${i18n.t('messages.config_success')}\n`));
  }

  async showMainMenu(): Promise<void> {
    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: i18n.t('wizard.main_menu'),
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
        { name: `❌ ${i18n.t('wizard.exit')}`, value: 'exit' }
      ]
    }]);

    switch (action) {
      case 'lang': await this.configLanguage(); break;
      case 'region': await this.configRegion(); break;
      case 'apikey': await this.configApiKey(); break;
      case 'tool': await this.showToolMenu(); break;
      case 'mcp': await this.showMcpMenu(); break;
      case 'uninstall': await this.showUninstallMenu(); break;
      case 'doctor': await this.runDoctor(); break;
      case 'exit': return;
    }

    if (action !== 'exit') {
      await this.showMainMenu();
    }
  }

  async showToolMenu(): Promise<void> {
    const autoConfigTools = ['claude-code', 'droid', 'opencode', 'continue', 'crush', 'codex', 'zed'];
    const instructionTools = ['cursor', 'cline', 'kilo-code', 'roo-code', 'trae', 'windsurf', 'grok-cli', 'aider', 'neovim'];
    
    const choices: any[] = [];
    
    // Auto-config tools first
    choices.push(new inquirer.Separator(chalk.cyan('── Auto-config ──')));
    for (const key of autoConfigTools) {
      const manager = toolManagers[key];
      const configured = manager.isConfigured?.() || false;
      const status = configured ? chalk.green('✓') : chalk.gray('○');
      choices.push({ name: `${status} ${manager.displayName}`, value: key });
    }
    
    // Instruction tools
    choices.push(new inquirer.Separator(chalk.cyan('── Manual config ──')));
    for (const key of instructionTools) {
      const manager = toolManagers[key];
      choices.push({ name: `  ${manager.displayName}`, value: key });
    }

    choices.push(new inquirer.Separator());
    choices.push({ name: chalk.gray('← Back'), value: 'back' });

    const { tool } = await inquirer.prompt([{
      type: 'list',
      name: 'tool',
      message: i18n.t('messages.select_tool'),
      choices,
      pageSize: 20
    }]);

    if (tool !== 'back') {
      const manager = toolManagers[tool];
      if (autoConfigTools.includes(tool)) {
        await this.configureToolWithOptions(tool);
      } else {
        // Just show instructions
        await manager.configure();
        await inquirer.prompt([{ type: 'input', name: 'continue', message: chalk.gray('Press Enter to continue...') }]);
      }
      await this.showToolMenu();
    }
  }

  async showMcpMenu(): Promise<void> {
    const mcpTools = [
      'mcp-claude-code', 'mcp-cursor', 'mcp-kiro', 'mcp-amazonq', 'mcp-droid',
      'mcp-grok', 'mcp-copilot', 'mcp-kilocode', 'mcp-gemini', 'mcp-warp',
      'mcp-claude-desktop', 'mcp-zed', 'mcp-vscode', 'mcp-crush'
    ];
    
    const choices = mcpTools.map(key => {
      const manager = toolManagers[key];
      const configured = manager.isConfigured?.() || false;
      const status = configured ? chalk.green('✓') : chalk.gray('○');
      return { name: `${status} ${manager.displayName}`, value: key };
    });

    choices.push(new inquirer.Separator() as any);
    choices.push({ name: `📋 ${i18n.t('wizard.mcp_info')}`, value: 'info' });
    choices.push({ name: chalk.gray('← Back'), value: 'back' });

    const { tool } = await inquirer.prompt([{
      type: 'list',
      name: 'tool',
      message: i18n.t('wizard.select_mcp'),
      choices,
      pageSize: 20
    }]);

    if (tool === 'info') {
      await toolManagers['mcp'].configure();
    } else if (tool !== 'back') {
      await this.configureToolWithOptions(tool);
    }
    
    if (tool !== 'back') {
      await this.showMcpMenu();
    }
  }

  async configureToolWithOptions(toolKey: string): Promise<void> {
    const manager = toolManagers[toolKey];
    const isConfigured = manager.isConfigured?.() || false;

    const choices = [
      { name: `⚙️  ${i18n.t('wizard.install_config')}`, value: 'install' },
    ];

    if (isConfigured) {
      choices.push({ name: `🗑️  ${i18n.t('wizard.remove_config')}`, value: 'uninstall' });
    }
    choices.push({ name: chalk.gray('← Back'), value: 'back' });

    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: `${manager.displayName || toolKey}:`,
      choices
    }]);

    if (action === 'install') {
      await manager.configure();
    } else if (action === 'uninstall') {
      await manager.uninstall?.();
      console.log(chalk.green(`✓ ${manager.displayName} ${i18n.t('messages.uninstalled')}`));
    }
  }

  async showUninstallMenu(): Promise<void> {
    const autoConfigTools = [
      'claude-code', 'droid', 'opencode', 'continue', 'crush', 'codex', 'zed',
      'mcp-claude-code', 'mcp-cursor', 'mcp-kiro', 'mcp-amazonq', 'mcp-droid',
      'mcp-grok', 'mcp-copilot', 'mcp-kilocode', 'mcp-gemini', 'mcp-warp',
      'mcp-claude-desktop', 'mcp-zed', 'mcp-vscode', 'mcp-crush'
    ];
    const configuredTools = autoConfigTools.filter(key => toolManagers[key].isConfigured?.());

    if (configuredTools.length === 0) {
      console.log(chalk.yellow(`\n${i18n.t('messages.no_configs')}\n`));
      return;
    }

    const choices = configuredTools.map(key => ({
      name: toolManagers[key].displayName,
      value: key
    }));
    choices.push({ name: chalk.red(i18n.t('wizard.uninstall_all')), value: 'all' } as any);
    choices.push({ name: chalk.gray('← Back'), value: 'back' } as any);

    const { tool } = await inquirer.prompt([{
      type: 'list',
      name: 'tool',
      message: i18n.t('wizard.select_uninstall'),
      choices
    }]);

    if (tool === 'back') return;

    if (tool === 'all') {
      const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: i18n.t('wizard.confirm_uninstall_all'),
        default: false
      }]);

      if (confirm) {
        for (const key of configuredTools) {
          await toolManagers[key].uninstall?.();
        }
        console.log(chalk.green(`\n✓ ${i18n.t('messages.all_uninstalled')}\n`));
      }
    } else {
      await toolManagers[tool].uninstall?.();
      console.log(chalk.green(`✓ ${toolManagers[tool].displayName} ${i18n.t('messages.uninstalled')}`));
      await this.showUninstallMenu();
    }
  }

  async configLanguage(): Promise<void> {
    const { lang } = await inquirer.prompt([{
      type: 'list',
      name: 'lang',
      message: i18n.t('messages.select_lang'),
      choices: [
        { name: 'English', value: 'en_US' },
        { name: 'Español', value: 'es_ES' },
        { name: '中文', value: 'zh_CN' }
      ],
      default: configManager.getLang()
    }]);

    configManager.setLang(lang);
    i18n.loadFromConfig(lang);
    console.log(chalk.green(`✓ ${i18n.t('lang.set_success')} ${lang}`));
  }

  async configRegion(): Promise<void> {
    const { region } = await inquirer.prompt([{
      type: 'list',
      name: 'region',
      message: i18n.t('messages.select_region'),
      choices: [
        { name: 'Global (api.minimax.io)', value: 'global' },
        { name: 'China (api.minimaxi.com)', value: 'china' }
      ],
      default: configManager.getRegion()
    }]);

    configManager.setRegion(region);
    console.log(chalk.green(`✓ Region: ${region}`));
  }

  async configApiKey(): Promise<void> {
    const currentKey = configManager.getApiKey();
    const masked = currentKey ? `${currentKey.slice(0, 8)}...${currentKey.slice(-4)}` : i18n.t('messages.not_set');
    
    console.log(chalk.gray(`${i18n.t('messages.current')}: ${masked}`));
    
    const { apiKey } = await inquirer.prompt([{
      type: 'password',
      name: 'apiKey',
      message: i18n.t('messages.enter_api_key'),
      mask: '*'
    }]);

    if (apiKey) {
      configManager.setApiKey(apiKey);
      console.log(chalk.green(`✓ ${i18n.t('messages.api_key_saved')}`));
    }
  }

  async runDoctor(): Promise<void> {
    console.log(chalk.cyan(`\n🩺 ${i18n.t('doctor.checking')}\n`));
    const config = configManager.getConfig();
    const check = (ok: boolean) => ok ? chalk.green('✓') : chalk.red('✗');
    
    console.log(`${check(!!config.api_key)} ${i18n.t('doctor.api_key')}: ${config.api_key ? i18n.t('doctor.configured') : i18n.t('doctor.not_configured')}`);
    console.log(`${check(true)} ${i18n.t('doctor.region')}: ${config.region || 'global'}`);
    console.log(`${check(true)} ${i18n.t('doctor.lang')}: ${config.lang}`);
    
    console.log(chalk.cyan(`\n📊 ${i18n.t('doctor.tools_status')}:\n`));
    
    let configuredCount = 0;
    for (const [key, manager] of Object.entries(toolManagers)) {
      if (key === 'mcp') continue;
      const configured = manager.isConfigured?.() || false;
      if (configured) {
        console.log(`  ${chalk.green('✓')} ${manager.displayName || key}`);
        configuredCount++;
      }
    }
    
    if (configuredCount === 0) {
      console.log(chalk.gray(`  ${i18n.t('messages.no_configs')}`));
    }
    
    console.log(`\n  Base URL (Anthropic): ${configManager.getBaseUrl('anthropic')}`);
    console.log(`  Base URL (OpenAI): ${configManager.getBaseUrl('openai')}\n`);
  }
}

export const wizard = new Wizard();
