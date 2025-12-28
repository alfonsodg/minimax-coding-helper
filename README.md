# MiniMax M2.1 Coding Helper

A CLI tool to configure [MiniMax M2.1](https://platform.minimax.io/) model in AI coding tools. Similar to `@z_ai/coding-helper` but for MiniMax.

```
┌─────────────────────────────────────────────────────────────┐
│                 MiniMax M2.1 Coding Helper                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────┐      ┌──────────────────────────────┐    │
│   │   mhelper   │─────▶│  Configure Coding Tools      │    │
│   └─────────────┘      │  • Claude Code, Cursor       │    │
│         │              │  • Cline, Kilo Code, Roo     │    │
│         │              │  • Droid, OpenCode, Crush    │    │
│         │              │  • Zed, Neovim, Aider...     │    │
│         │              └──────────────────────────────┘    │
│         │                                                   │
│         │              ┌──────────────────────────────┐    │
│         └─────────────▶│  Configure MCP Servers       │    │
│                        │  • web_search                │    │
│                        │  • understand_image          │    │
│                        │  For 14+ AI agents           │    │
│                        └──────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Features

- 🔧 **Auto-Configuration** - Automatically writes config files for supported tools
- 🗑️ **Uninstall** - Remove MiniMax configuration from any tool
- 🌐 **MCP Server** - Configure `web_search` & `understand_image` tools for 14+ agents
- 🩺 **Health Check** - See what's configured at a glance
- 🌍 **Multi-language** - English, Español, 中文
- 📍 **Multi-region** - Global (`api.minimax.io`) and China (`api.minimaxi.com`)

## Installation

```bash
# npm (recommended)
npm install -g @alfonsodg/minimax-coding-helper

# pnpm
pnpm add -g @alfonsodg/minimax-coding-helper

# yarn
yarn global add @alfonsodg/minimax-coding-helper

# From source
git clone https://github.com/alfonsodg/minimax-coding-helper
cd minimax-coding-helper
pnpm install && pnpm build
npm link
```

## Links

- **npm**: https://www.npmjs.com/package/@alfonsodg/minimax-coding-helper
- **GitHub**: https://github.com/alfonsodg/minimax-coding-helper

## Usage

```bash
# Interactive menu (recommended)
mhelper

# First-time setup wizard
mhelper init

# Check configuration status
mhelper doctor
```

### Interactive Menu

```
? What would you like to do?
❯ 🔧 Configure coding tool
  🌐 Configure MCP server
  🗑️  Remove configuration
  ─────────────
  🌍 Change language
  📍 Change region
  🔑 Change API key
  🩺 Health check
  ─────────────
  ❌ Exit
```

## Supported Tools

### Auto-Configuration (writes config files)

| Tool | Config File | Status |
|------|-------------|--------|
| Claude Code | `~/.claude/settings.json` | ✅ |
| Droid | `~/.factory/config.json` | ✅ |
| OpenCode | `~/.config/opencode/opencode.json` | ✅ |
| Continue | `~/.continue/config.json` | ✅ |
| Crush | `~/.config/crush/crush.json` | ✅ |
| Codex CLI | `~/.codex/config.toml` | ✅ |
| Zed | `~/.config/zed/settings.json` | ✅ |

### Manual Configuration (shows instructions)

| Tool | Notes |
|------|-------|
| Cursor | GUI configuration |
| Cline | VS Code extension (M2.1 coming soon, use M2) |
| Kilo Code | VS Code extension |
| Roo Code | VS Code extension |
| TRAE | GUI configuration |
| Windsurf | GUI configuration |
| Grok CLI | Environment variables (not recommended) |
| Aider | Environment variables |
| Neovim | avante.nvim / codecompanion.nvim |

### MCP Server Configuration

Configure MiniMax MCP tools (`web_search`, `understand_image`) for multiple agents:

| Agent | Config File | Format |
|-------|-------------|--------|
| Claude Code | `~/.claude.json` | mcpServers |
| Cursor | `~/.cursor/mcp.json` | mcpServers |
| Kiro | `~/.kiro/settings/mcp.json` | mcpServers |
| Amazon Q | `~/.aws/amazonq/mcp.json` | mcpServers |
| Droid | `~/.factory/mcp.json` | mcpServers |
| Grok | `~/.grok/mcp.json` | mcpServers |
| Copilot CLI | `~/.copilot/mcp-config.json` | mcpServers |
| Kilocode | `~/.kilocode/mcp.json` | mcpServers |
| Gemini | `~/.gemini/antigravity/mcp_config.json` | mcpServers |
| Warp | `~/.config/warp/mcp.json` | mcpServers |
| Claude Desktop | `~/.config/Claude/claude_desktop_config.json` | mcpServers |
| Zed | `~/.config/zed/settings.json` | context_servers |
| VS Code | `~/.config/Code/User/settings.json` | chat.mcp.servers |
| Crush | `~/.config/crush/crush.json` | mcp (type: stdio) |

## Configuration

Config stored at `~/.minimax-helper/config.yaml`:

```yaml
lang: en_US          # en_US, es_ES, zh_CN
region: global       # global or china
api_key: <your-key>
```

## API Endpoints

| Region | Anthropic API | OpenAI API |
|--------|---------------|------------|
| Global | `https://api.minimax.io/anthropic` | `https://api.minimax.io/v1` |
| China | `https://api.minimaxi.com/anthropic` | `https://api.minimaxi.com/v1` |

## Examples

### Configure Claude Code with MiniMax M2.1

```bash
mhelper
# Select: Configure coding tool → Claude Code → Install/Configure
```

Result in `~/.claude/settings.json`:
```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.minimax.io/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "<your-api-key>",
    "ANTHROPIC_MODEL": "MiniMax-M2.1"
  }
}
```

### Configure MCP for multiple agents

```bash
mhelper
# Select: Configure MCP server → (select agents)
```

Result adds MiniMax MCP server with `web_search` and `understand_image` tools.

### Check what's configured

```bash
mhelper doctor
```

Output:
```
🩺 Checking configuration...

✓ API Key: Configured
✓ Region: global
✓ Language: en_US

📊 Configured tools:

  ✓ Claude Code
  ✓ Droid
  ✓ MCP (Claude Code)
  ✓ MCP (Cursor)

  Base URL (Anthropic): https://api.minimax.io/anthropic
  Base URL (OpenAI): https://api.minimax.io/v1
```

## Prerequisites

### For MCP tools

```bash
# Install uvx (required for MCP server)
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Get API Key

1. Visit [MiniMax Platform](https://platform.minimax.io/user-center/basic-information/interface-key)
2. Subscribe to [Coding Plan](https://platform.minimax.io/subscribe/coding-plan) (optional, for better rates)
3. Create API key
4. Run `mhelper init`

## Documentation

- [MiniMax M2.1 for AI Coding Tools](https://platform.minimax.io/docs/guides/text-ai-coding-tools)
- [MiniMax MCP Guide](https://platform.minimax.io/docs/guides/coding-plan-mcp-guide)
- [MiniMax Tool Use & Interleaved Thinking](https://platform.minimax.io/docs/guides/text-m2-function-call)

## Author

**Alfonso de la Guarda**  
📧 alfonso@gmail.com

## License

Apache-2.0
