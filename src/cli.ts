#!/usr/bin/env node
import { Command } from './lib/command.js';

async function main() {
  const command = new Command();
  try {
    await command.execute(process.argv.slice(2));
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
