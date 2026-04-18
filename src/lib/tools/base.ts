import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { configManager, deepMerge } from '../config.js';
import { i18n } from '../i18n.js';
import { logger } from '../logger.js';

export interface ToolManager {
  name: string;
  displayName: string;
  configure(): Promise<boolean>;
  uninstall?(): Promise<boolean>;
  isInstalled(): boolean;
  isConfigured?(): boolean;
}

export function readJsonSafe(path: string): Record<string, unknown> {
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch (err) {
    logger.warn(`Could not parse ${path}: ${(err as Error).message}`);
    return {};
  }
}

export function writeJsonSafe(path: string, data: Record<string, unknown>): boolean {
  try {
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    logger.error(`Failed to write ${path}: ${(err as Error).message}`, err);
    return false;
  }
}

export abstract class JsonConfigTool implements ToolManager {
  abstract name: string;
  abstract displayName: string;
  abstract configPath: string;

  abstract getConfig(): Record<string, unknown>;
  abstract checkConfigured(content: Record<string, unknown>): boolean;

  isInstalled(): boolean { return true; }

  isConfigured(): boolean {
    if (!existsSync(this.configPath)) return false;
    return this.checkConfigured(readJsonSafe(this.configPath));
  }

  async configure(): Promise<boolean> {
    if (!configManager.getApiKey()) {
      console.log(chalk.red(i18n.t('messages.no_api_key')));
      return false;
    }
    const existing = readJsonSafe(this.configPath);
    const merged = deepMerge(existing, this.getConfig());
    if (!writeJsonSafe(this.configPath, merged)) return false;
    console.log(chalk.green(`✓ ${this.displayName} ${i18n.t('messages.config_success')}`));
    return true;
  }

  abstract cleanConfig(content: Record<string, unknown>): void;

  async uninstall(): Promise<boolean> {
    if (!existsSync(this.configPath)) return true;
    const content = readJsonSafe(this.configPath);
    this.cleanConfig(content);
    return writeJsonSafe(this.configPath, content);
  }
}
