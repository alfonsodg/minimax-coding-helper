export type { ToolManager } from './base.js';

import type { ToolManager } from './base.js';
import { ClaudeCodeManager } from './auto-config/claude-code.js';
import { DroidManager } from './auto-config/droid.js';
import { OpenCodeManager } from './auto-config/opencode.js';
import { ContinueManager } from './auto-config/continue.js';
import { CrushManager } from './auto-config/crush.js';
import { CodexManager } from './auto-config/codex.js';
import { ZedManager } from './auto-config/zed.js';
import { mcpManagers } from './mcp/registry.js';
import { instructionManagers } from './instructions/index.js';

export const toolManagers: Record<string, ToolManager> = {
  'claude-code': new ClaudeCodeManager(),
  'droid': new DroidManager(),
  'opencode': new OpenCodeManager(),
  'continue': new ContinueManager(),
  'crush': new CrushManager(),
  'codex': new CodexManager(),
  'zed': new ZedManager(),
  ...instructionManagers,
  ...mcpManagers,
};
