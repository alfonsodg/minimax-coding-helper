import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import * as yaml from 'js-yaml';

export interface Config {
  lang: string;
  region?: 'global' | 'china';
  api_key?: string;
}

export class ConfigManager {
  private static instance: ConfigManager;
  private configDir: string;
  private configPath: string;
  private config: Config;

  private constructor() {
    this.configDir = join(homedir(), '.minimax-helper');
    this.configPath = join(this.configDir, 'config.yaml');
    this.config = this.loadConfig();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private ensureConfigDir(): void {
    if (!existsSync(this.configDir)) {
      mkdirSync(this.configDir, { recursive: true });
    }
  }

  private loadConfig(): Config {
    try {
      if (existsSync(this.configPath)) {
        const content = readFileSync(this.configPath, 'utf-8');
        return (yaml.load(content) as Config) || { lang: 'en_US' };
      }
    } catch { /* ignore */ }
    return { lang: 'en_US' };
  }

  saveConfig(config?: Config): void {
    this.ensureConfigDir();
    const toSave = config || this.config;
    writeFileSync(this.configPath, yaml.dump(toSave), 'utf-8');
    this.config = toSave;
  }

  getConfig(): Config { return { ...this.config }; }
  isFirstRun(): boolean { return !existsSync(this.configPath); }
  
  getLang(): string { return this.config.lang || 'en_US'; }
  setLang(lang: string): void { this.config.lang = lang; this.saveConfig(); }
  
  getRegion(): 'global' | 'china' { return this.config.region || 'global'; }
  setRegion(region: 'global' | 'china'): void { this.config.region = region; this.saveConfig(); }
  
  getApiKey(): string | undefined { return this.config.api_key; }
  setApiKey(key: string): void { this.config.api_key = key; this.saveConfig(); }
  revokeApiKey(): void { this.config.api_key = undefined; this.saveConfig(); }

  getBaseUrl(type: 'openai' | 'anthropic' = 'anthropic'): string {
    const host = this.config.region === 'china' ? 'api.minimaxi.com' : 'api.minimax.io';
    return type === 'openai' ? `https://${host}/v1` : `https://${host}/anthropic`;
  }
}

export const configManager = ConfigManager.getInstance();
