import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from './logger.js';

type Translations = Record<string, string>;

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = join(__dirname, '..', 'locales');

function loadLocale(lang: string): Translations {
  try {
    return JSON.parse(readFileSync(join(LOCALES_DIR, `${lang}.json`), 'utf-8'));
  } catch (err) {
    logger.debug(`Could not load locale ${lang}: ${(err as Error).message}`);
    return {};
  }
}

class I18n {
  private locale = 'en_US';
  private cache: Record<string, Translations> = {};

  loadFromConfig(lang: string): void {
    this.locale = lang;
    if (!this.cache[lang]) this.cache[lang] = loadLocale(lang);
    if (!this.cache['en_US']) this.cache['en_US'] = loadLocale('en_US');
  }

  t(key: string): string {
    return this.cache[this.locale]?.[key] || this.cache['en_US']?.[key] || key;
  }

  getLocale(): string { return this.locale; }
}

export const i18n = new I18n();
