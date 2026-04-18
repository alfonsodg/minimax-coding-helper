# Development Standards

## Stack

- TypeScript 5.9+, strict mode, ESM (`"type": "module"`)
- Node.js >= 18.0.0
- pnpm (package manager)
- `commander` (CLI), `inquirer` (prompts), `chalk` (colors), `js-yaml` (YAML), `smol-toml` (TOML)

## Code Style

- Conventional Commits: `<type>(<scope>): <subject>`
- No unused dependencies or imports
- No empty catch blocks — all errors logged with context via `logger.ts`
- API keys never printed in full — use `maskApiKey()` from `config.ts`
- Deep merge for JSON config files — never shallow spread on nested objects
- TOML files parsed with `smol-toml`, never regex

## Architecture

```text
src/
├── cli.ts                    # Entry point
├── index.ts                  # Public exports
├── locales/                  # i18n JSON files (en_US, es_ES, zh_CN)
└── lib/
    ├── config.ts             # ConfigManager singleton, deepMerge, maskApiKey
    ├── command.ts            # CLI command setup (commander)
    ├── i18n.ts               # Locale loader from JSON files
    ├── logger.ts             # Structured logging (error, warn, debug)
    ├── wizard.ts             # Interactive menus (inquirer)
    └── tools/
        ├── base.ts           # ToolManager interface, JsonConfigTool abstract class
        ├── index.ts           # Tool registry (all managers)
        ├── auto-config/      # One file per auto-configured tool
        ├── mcp/              # MCP base class + registry
        └── instructions/     # Manual instruction tools
```

## Adding a New Tool

1. Auto-config: create `src/lib/tools/auto-config/<name>.ts` extending `JsonConfigTool`
2. MCP: add entry in `src/lib/tools/mcp/registry.ts` using `createMcpManager()`
3. Instructions: add entry in `src/lib/tools/instructions/index.ts`
4. Register in `src/lib/tools/index.ts`

## Build

```bash
pnpm build    # tsc + copy locales
pnpm dev      # tsx watch mode
```
