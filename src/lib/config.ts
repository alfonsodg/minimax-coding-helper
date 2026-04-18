import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import * as yaml from 'js-yaml';
import { logger } from './logger.js';

export interface Config {
  lang: string;
  region?: 'global' | 'china';
  api_key?: string;
}

export function maskApiKey(key: string | undefined): string {
  if (!key) return '(not set)';
  if (key.length <= 12) return '****';
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

export function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const sv = source[key], tv = target[key];
    if (sv && typeof sv === 'object' && !Array.isArray(sv) && tv && typeof tv === 'object' && !Array.isArray(tv)) {
      result[key] = deepMerge(tv as Record<string, unknown>, sv as Record<string, unknown>);
    } else {
      result[key] = sv;
    }
  }
  return result;
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
      mkdirSync(this.configDir, { recursive: true, mode: 0o700 });
    }
  }

  private loadConfig(): Config {
    try {
      if (existsSync(this.configPath)) {
        const content = readFileSync(this.configPath, 'utf-8');
        return (yaml.load(content) as Config) || { lang: 'en_US' };
      }
    } catch (err) {
      logger.warn(`Could not read config: ${(err as Error).message}`);
    }
    return { lang: 'en_US' };
  }

  saveConfig(config?: Config): void {
    this.ensureConfigDir();
    const toSave = config || this.config;
    try {
      writeFileSync(this.configPath, yaml.dump(toSave), { encoding: 'utf-8', mode: 0o600 });
      chmodSync(this.configPath, 0o600);
      this.config = toSave;
    } catch (err) {
      logger.error(`Failed to save config: ${(err as Error).message}`, err);
    }
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
