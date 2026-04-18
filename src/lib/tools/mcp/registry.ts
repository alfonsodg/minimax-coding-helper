import { join } from 'path';
import { homedir } from 'os';
import { createMcpManager } from './base-mcp.js';
import type { ToolManager } from '../base.js';

const h = homedir();

export const mcpManagers: Record<string, ToolManager> = {
  'mcp-claude-code': createMcpManager('mcp-claude-code', 'MCP (Claude Code)', join(h, '.claude.json')),
  'mcp-cursor': createMcpManager('mcp-cursor', 'MCP (Cursor)', join(h, '.cursor', 'mcp.json')),
  'mcp-kiro': createMcpManager('mcp-kiro', 'MCP (Kiro)', join(h, '.kiro', 'settings', 'mcp.json')),
  'mcp-amazonq': createMcpManager('mcp-amazonq', 'MCP (Amazon Q)', join(h, '.aws', 'amazonq', 'mcp.json')),
  'mcp-droid': createMcpManager('mcp-droid', 'MCP (Droid)', join(h, '.factory', 'mcp.json')),
  'mcp-grok': createMcpManager('mcp-grok', 'MCP (Grok)', join(h, '.grok', 'mcp.json')),
  'mcp-copilot': createMcpManager('mcp-copilot', 'MCP (Copilot CLI)', join(h, '.copilot', 'mcp-config.json')),
  'mcp-kilocode': createMcpManager('mcp-kilocode', 'MCP (Kilocode)', join(h, '.kilocode', 'mcp.json')),
  'mcp-gemini': createMcpManager('mcp-gemini', 'MCP (Gemini)', join(h, '.gemini', 'antigravity', 'mcp_config.json')),
  'mcp-warp': createMcpManager('mcp-warp', 'MCP (Warp)', join(h, '.config', 'warp', 'mcp.json')),
  'mcp-claude-desktop': createMcpManager('mcp-claude-desktop', 'MCP (Claude Desktop)', join(h, '.config', 'Claude', 'claude_desktop_config.json')),
  'mcp-zed': createMcpManager('mcp-zed', 'MCP (Zed)', join(h, '.config', 'zed', 'settings.json'), 'context_servers'),
  'mcp-vscode': createMcpManager('mcp-vscode', 'MCP (VS Code)', join(h, '.config', 'Code', 'User', 'settings.json'), 'chat.mcp.servers'),
  'mcp-crush': createMcpManager('mcp-crush', 'MCP (Crush)', join(h, '.config', 'crush', 'crush.json'), 'mcp'),
};
