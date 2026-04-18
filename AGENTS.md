# AI Agents Guide

Core principles for AI coding assistants.
Compatible with the AGENTS.md open standard (Linux Foundation AAIF).

## Language & Communication

- Code, comments, documentation, commits, issues: **English only**
- Agent communication with user: **Spanish only**
- Mem0 entries: **Spanish only**
- Multilingual projects: **Must use i18n** (according to specs)

## Platform Defaults

- **Primary GitLab**: Self-hosted at `scovil.labtau.com` — all repos, issues, MRs, CI/CD, container registry
- **GitHub**: Only when project has GitHub remote connected OR user explicitly requests it
- Prefer GitLab MCP → fallback `glab` CLI. For GitHub: GitHub MCP → `gh` CLI
- **This rule applies everywhere below** — not repeated per section

## Core Principles

- **Conventional Commits**: `<type>(<scope>): <subject>` — types: feat, fix, docs, style, refactor, test, chore
- **Naming**: Descriptive, self-documenting names
- **Comments**: Explain "why" not "what"
- **No Hacks**: No hardcoded values, workarounds, or magic numbers
- **Modify First**: Always modify existing files before creating new ones
- **No MD Generation**: Never create .md files unless explicitly requested
- **Markdown Quality**: All generated `.md` must comply with [CommonMark](https://commonmark.org/) standard. Validate with `markdownlint` (`mdl` or `markdownlint-cli2`) before committing
- **Markdown Naming**: All `.md` files MUST use UPPERCASE names (e.g., `README.md`, `ARCHITECTURE.md`, not `readme.md`)
- **Mermaid Diagrams**: Must comply with [Mermaid syntax](https://mermaid.js.org/). Keep compact — must render correctly on A4 page. Avoid long vertical chains; prefer wide layouts, group nodes, and split large diagrams into multiple smaller ones
- **Diagrams Policy**: Mermaid diagrams **only in DIAGRAMS.md**. All other `.md` files must use ASCII diagrams if visual representation is needed
- **MCP Tools**: Use available MCP tools for every task (see MCP_TOOLS.md)
- **Context7**: Always use for library docs — never rely on training data
- **Mem0**: Save all important info with project context (userId = project name)
- **Verification**: Always verify changes before declaring completion
- **Workflow**: Issues → Mem0 → Git commits for every task
- **Project State Recovery**: When context is lost, check Issues + Mem0 + Git history

## Agent Autonomy

**Complete tasks from start to finish without stopping for confirmation.**

Do everything autonomously: create/modify/delete files, run tests, fix errors, commit, push, update docs, deploy. Never ask "should I continue?" or "shall I proceed?".

**Only ask confirmation for:**
- Deleting files outside project directory
- Changes to production systems/databases
- Modifying security configurations or system files

## REMOTE.md - Project Remote Configuration

**Every project MUST have a `REMOTE.md`** in the project root containing all remote deployment information.

**REMOTE.md is NEVER tracked in git** — add to `.gitignore` immediately.

**REMOTE.md is ONLY for infrastructure**: servers, IPs, ports, SSH users, services, security configs, environment variables, certificates, databases, container registries. **Never use it to document code, features, or changes** — that belongs in README.md, ARCHITECTURE.md, or git history. Keep it always up to date.

**Required project documentation:**

**Root directory** (only these files at project root):
- `README.md` — **mandatory for every repo**. Project description, objectives, features, differentiators, and advantages. Must be explanatory and sell the project
- `REMOTE.md` — **mandatory for every repo**. Deployment info (never tracked in git)
- `LICENSE` — **only for public repos** (non-private). License type defined by the user — never add a license without asking

**`docs/` directory** (tracked in git — all project documentation goes here):
- `docs/STANDARDS.md` — **mandatory for every repo**. Synthesis of the development style rules applied to the project, always derived from the specialized guides (PYTHON.MD, REACT.MD, TYPESCRIPT.MD, etc.). Includes: language version, libraries, linters, formatters, coding patterns, testing approach
- `docs/ARCHITECTURE.md` — only when explicitly requested by user/developer
- `docs/DATABASE.md` — only when explicitly requested by user/developer
- `docs/DIAGRAMS.md` — only when explicitly requested by user/developer. Contains **only Mermaid diagrams** documenting project flows, architecture, sequences, and state machines. No prose — just diagrams with minimal titles
- Any other project docs go in `docs/`

**`reference/` directory** (NEVER tracked in git — add to `.gitignore`):
- User requirements, acceptance criteria, mockups
- Test evidence, screenshots, test reports
- Flow diagrams, wireframes, design specs
- External API docs, third-party references
- Any supporting material that informs development but is not source code

**Documentation maintenance:** Documentation is updated **only when explicitly requested by the user**. Never auto-update README.md, STANDARDS.md, ARCHITECTURE.md, or other docs as part of code changes unless the user asks for it.

**Must contain:**
- Remote server URLs and IPs
- SSH users and access method
- Systemd service names and status commands
- Project directories on remote (app, logs, config)
- Nginx virtual host configuration and hostname
- Database connection details (host, port, name, user)
- Environment variables and secrets
- Container registry URLs and image names
- Any project-specific deployment commands

**Template:**
```markdown
# Remote Configuration - [Project Name]

## Server
- Host: `project.example.com` / `10.0.0.x`
- SSH: `ssh user@host`
- App dir: `/opt/project/`
- Logs: `/var/log/project/`

## Services
- Systemd: `project-api.service`, `project-worker.service`
- Status: `sudo systemctl status project-api`
- Restart: `sudo systemctl restart project-api`

## Nginx
- Config: `/etc/nginx/sites-available/project.conf`
- Frontend: `/var/www/project/`
- Hostname: `project.example.com`

## Database
- Host: localhost / remote
- Port: 5432
- Name: project_db
- User: project_user

## Container
- Registry: `registry.example.com/project`
- Pull: `docker pull registry.example.com/project:latest`

## Environment
- `.env` location: `/opt/project/.env`
- Key variables: DB_URL, SECRET_KEY, API_KEY
```

**When starting work on any project:**
1. Check if REMOTE.md exists — if not, ask user for remote details and create it
2. Read REMOTE.md to understand deployment target
3. Save remote info to Mem0 for context persistence

## Deployment Workflow - MANDATORY

**All testing and deployment happens on remote servers, NEVER locally.**

### Development Mode

The user can work **locally** or **directly on a remote server**:

- **Local development**: Code is written locally, pushed via git, and tested on a designated remote server
- **Remote development**: Code is written and tested directly on the remote server (e.g., via SSH)
- **The user specifies which remote server to use for testing** — always ask if not clear from REMOTE.md or Mem0
- **Never install Docker, databases, or services on the local machine** — all services run on the remote test server
- **Exception**: If development is happening directly on the remote server, services can be installed/run there

### The Flow

```
Local:  code → commit → push → deploy branch to remote → test on remote → MR → merge
Remote: code on remote → test on remote → commit → push → MR → merge
Release: tag on main → CI builds container → deploy to production
```

### Rules

1. **Commit and push**: Every change goes through git
2. **Tag for release**: Create git tag to trigger container build in CI/CD
3. **Deploy via git pull**: On remote server, always `git pull` — **never scp for code**
4. **scp only for specific files**: Config files, .env, certificates — not application code
5. **No local Docker**: Don't run containers locally — containers are for CI/CD and remote deployment. **All Dockerfiles must be multi-stage** (build + runtime stages)
6. **No local services**: Don't install databases, message brokers, or runtime services locally — use the remote test server
7. **Nginx for frontends**: Deploy frontend builds to remote Nginx, configure virtual hosts per project hostname
8. **Clean repos**: No temp files, build artifacts, IDE configs, or unnecessary files in git. Maintain proper `.gitignore` — commit only source code, docs, and config
9. **Health checks**: Every deployed service MUST expose `/health` endpoint. Verify after every deploy

### .gitignore Baseline

Every repo must exclude at minimum:
```gitignore
# Environment & secrets
.env
.env.*
!.env.example
REMOTE.md

# AI agents & copilot — NEVER track
AGENTS.md
.github/copilot-instructions.md
.github/copilot*.md
.copilot/
.kiro/
.cursor/
.aider*
.continue/
.cline/
.roo/
.windsurf/
.augment*
codex.md
claude.md
CLAUDE.md
.claude/

# Debug & screenshots — NEVER track
debug/

# Reference docs — NEVER track
reference/

# Language artifacts — Python
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
*.egg-info/
*.egg
.eggs/
pip-log.txt
.mypy_cache/
.ruff_cache/
.pytest_cache/
.coverage
htmlcov/
.tox/
.venv/
venv/
env/

# Language artifacts — Node/JS/TS
node_modules/
dist/
build/
.next/
.nuxt/
.output/
.turbo/
*.tsbuildinfo
.eslintcache

# Language artifacts — Go
/vendor/
*.exe
*.test
*.out

# Language artifacts — Rust
target/
Cargo.lock
# Keep Cargo.lock for binaries, exclude for libraries

# Language artifacts — Java/JVM
*.class
*.jar
*.war
.gradle/
build/

# IDE & OS
.idea/
.vscode/
*.swp
*.swo
*~
.DS_Store
Thumbs.db
Desktop.ini
.directory

# Logs & temp
*.log
tmp/
.cache/
*.tmp
*.bak
*.orig

# Docker (local)
docker-compose.override.yml

# Databases (local)
*.sqlite3
*.db
```

### Pre-commit Hooks

Recommended for all projects:
- `commitlint` — enforce Conventional Commits format
- `markdownlint` — validate `.md` files against CommonMark
- Language linters (`ruff` for Python, `eslint` for JS/TS, `golangci-lint` for Go)

### Deployment Steps

```bash
# 1. Local: commit and push (on feature branch)
git add -A && git commit -m "feat(api): add endpoint (#15)" && git push

# 2. Remote: deploy branch for testing (via SSH)
ssh user@remote "cd /opt/project && git fetch && git checkout feature/api && git pull"
ssh user@remote "sudo systemctl restart project-api"
ssh user@remote "curl -s http://localhost:8080/health"

# 3. After validation: MR → merge to main

# 4. Local: tag for release (on main, after merge)
git checkout main && git pull
git tag -a v1.2.0 -m "Release v1.2.0" && git push --tags

# 5. Remote: deploy release
ssh user@remote "cd /opt/project && git checkout main && git pull && sudo systemctl restart project-api"
ssh user@remote "curl -s http://localhost:8080/health"

# 6. Remote: frontend (build locally, deploy to nginx)
npm run build  # local
scp -r dist/* user@remote:/var/www/project/  # scp OK for built assets
ssh user@remote "sudo systemctl reload nginx"
```

### Nginx Setup (System Nginx, NOT Docker)

Use the remote server's system Nginx (not containerized) as reverse proxy for all projects:

- **One subdomain per project** — the user assigns the subdomain (e.g., `myapp.example.com`). Always ask if not defined in REMOTE.md
- **Non-standard ports only** — backend services MUST use ports in range **8020–8990** to avoid conflicts with other services
- **SSL with Let's Encrypt** — every subdomain gets a certificate via `certbot`
- Config at `/etc/nginx/sites-available/project.conf`, symlinked to `sites-enabled`
- Frontend can be: static files in `/var/www/project/`, a running service on a port, or a Docker container — Nginx reverse-proxies to whatever is serving the app
- API reverse-proxied to backend service port

```nginx
server {
    server_name myapp.example.com;

    # Option A: Frontend as static files
    location / {
        root /var/www/myapp;
        try_files $uri $uri/ /index.html;
    }

    # Option B: Frontend as running service or container
    # location / {
    #     proxy_pass http://127.0.0.1:8046;
    # }

    # API reverse proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8045;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/myapp.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/myapp.example.com/privkey.pem;
}
```

```bash
# SSL setup
sudo certbot --nginx -d myapp.example.com
```

- Document subdomain, port, and nginx config path in REMOTE.md

### Rollback Procedures

When a deploy fails:
1. **Code rollback**: `git checkout v1.1.0 && sudo systemctl restart project-api` (previous tag)
2. **DB rollback**: Run reverse migration before code rollback if schema changed
3. **Container rollback**: Redeploy previous image tag from registry
4. Always verify `/health` after rollback
5. Create `priority::critical` issue documenting what failed and why

### Secrets in CI/CD

- **Never** hardcode secrets in `.gitlab-ci.yml`, Dockerfiles, or source code
- Use GitLab CI/CD variables (Settings → CI/CD → Variables) with `masked` + `protected` flags
- Rotate tokens and credentials periodically
- `.env` files are deployed via `scp`, never committed

### Database Migrations

- Use framework migration tools: `alembic` (Python), `prisma migrate` (Node), `goose` (Go)
- Every schema change = a migration file committed to git
- Migrations run on remote before app restart: `ssh user@remote "cd /opt/project && alembic upgrade head"`
- **Always create reverse migration** — rollback must be possible
- Test migrations on branch deploy before merging to main

## Language Versions

Use latest stable:
- **Python**: 3.14+ with `uv` (mandatory). Use 3.13/3.12/3.11 for library compat (ML, crypto). Never `pip` directly.
- **Node.js**: LTS (24.x active, 22.x maintenance)
- **Go**: 1.26+ | **Rust**: 1.84+ | **TypeScript**: 5.9+ | **Java**: JDK 25 (21 also supported)

**Package management:**
- Always latest stable versions. Avoid beta/alpha unless requested.
- Use older versions only when stack incompatibility is confirmed — document reason.
- Document version pinning with reason in comments.

## Git Branching

- **`main`**: Production-ready code. Deploy from here. **Never merge untested code.**
- **`feature/<name>`**: New features. Test and validate on remote from this branch.
- **`fix/<name>`**: Bug fixes. Test on remote before merging.
- **`hotfix/<name>`**: Critical production fixes. MR to main, tag immediately.
- **All testing happens on branches** — deploy branch to remote, validate, then merge to main.
- **Only merge to main when**: all required features work, tests pass on remote, code is stable.
- Direct push to `main` only for trivial changes (typos, config).
- Always create MR for significant changes.
- Delete branch after merge.

## Code Quality

**Error Handling:**
- Always handle errors explicitly — no silent catches
- Use language-appropriate patterns: try/except (Python), Result (Rust), error returns (Go)
- Log errors with context (what failed, with what input)
- Return meaningful error messages to users

**Input Validation:**
- Validate all external input (API params, form data, CLI args)
- Sanitize for SQL injection, XSS, path traversal
- Validate types, ranges, and formats at boundaries

**Logging:**
- Use structured logging (JSON preferred)
- Levels: ERROR (failures), WARN (degraded), INFO (operations), DEBUG (development)
- Include: timestamp, level, message, context (request_id, user_id)
- Never log secrets, passwords, or tokens

**Testing:**
- Tests are **optional** unless explicitly requested
- When requested: unit tests for business logic, integration tests for APIs
- Run tests on remote server, not locally

## Task Management

**Issues are the single source of truth for all work.** Every task, bug, improvement, and analysis finding MUST be tracked as an issue. No work happens without an issue.

### Mandatory: Issues from Analysis

**Every project analysis, code review, or state assessment MUST produce issues** for ALL problems and improvements found. An analysis without issues created is incomplete and invalid.

- One issue per problem/improvement (don't bundle unrelated items)
- Each issue MUST have a priority label
- **Every issue MUST include:**
  - Clear description of the problem (what's wrong and why it matters)
  - Exact location: file path, line number, function/class name
  - Code snippet showing the problematic code
  - Impact: security risk, performance degradation, maintainability, correctness
  - **Proposed solution** with specific implementation steps or code example
  - Acceptance criteria: how to verify the fix is correct
- Analysis summary as parent issue with checklist linking child issues
- **Never create vague issues** — "fix this" or "improve that" without details is not acceptable

### Commits MUST Reference Issues

**Every commit MUST be associated with an issue.** No orphan commits.

- Format: `<type>(<scope>): <subject> (#issue_number)` — e.g., `fix(auth): validate token expiry (#42)`
- Multiple commits per issue are normal (one per logical change)
- Use `Closes #N` in the final commit or MR description to auto-close
- Use `Ref #N` for intermediate commits that don't close the issue yet
- **Never commit without an issue reference** — create the issue first if it doesn't exist

### Tracking Pending Work

**Open issues = pending work.** This is the only way to track what's left.

- Before starting work on any project: check open issues first
- Prioritize by labels: `priority::critical` → `priority::high` → `priority::medium` → `priority::low`
- When context is lost or resuming work: `open issues + Mem0 + git log` = full project state
- Close issues only when the fix is verified on remote (not just committed)
- Stale issues (>30 days without activity) should be reviewed and re-prioritized or closed

### Priority Labels
- `priority::critical` — fix immediately (security, data loss, broken prod)
- `priority::high` — fix same day (broken features, degraded performance)
- `priority::medium` — fix within week (tech debt, minor bugs)
- `priority::low` — backlog (improvements, nice-to-haves)

### Workflow
1. Check open issues — pick highest priority or create new issue
2. Create issue with priority label and acceptance criteria (if new work)
3. Work on feature branch named after issue: `fix/42-token-expiry`
4. One commit per logical change, always reference issue: `Ref #42` or `Closes #42`
5. Create MR → merge → issue auto-closes
6. Tag → deploy → verify on remote

## UI Development

Use **Playwright** (testing/automation) and **Chrome DevTools** (debugging) for all UI work.
**Every new or updated UI/UX feature MUST be validated automatically** using Playwright MCP or Chrome DevTools MCP — never rely on manual visual checks alone.

### Screenshot Validation (Mandatory)

Every UI change MUST produce screenshots saved to `debug/` directory (never tracked in git):

1. **Capture**: Take screenshots of every new/modified view at mobile (375px), tablet (768px), and desktop (1920px)
2. **Save**: All screenshots go to `debug/` in project root — filenames: `{feature}-{viewport}-{timestamp}.png`
3. **Validate**: Visually inspect the resulting images to confirm they match the requirements (layout, colors, spacing, content, responsiveness)
4. **Evidence**: If the screenshot does NOT match requirements, fix and re-capture before declaring complete
5. **Cleanup**: `debug/` is ephemeral — delete old screenshots periodically, never commit them

```bash
# Example: debug/ structure
debug/
├── login-mobile-20260418.png
├── login-desktop-20260418.png
├── dashboard-tablet-20260418.png
└── form-validation-error-mobile-20260418.png
```

Verify: tests pass, no console errors, responsive works, accessibility passes, **screenshots in debug/ confirm visual correctness**.
See UI_TESTING.md for complete guide.

## Verification Checklist

Before declaring complete:
- [ ] Code works on remote server (not just locally)
- [ ] Tests pass (if applicable)
- [ ] Linting/formatting passes
- [ ] Issue created and updated
- [ ] Commit messages are descriptive
- [ ] Important decisions saved to Mem0
- [ ] REMOTE.md exists and is current
- [ ] Pipeline passes (if CI/CD configured)
- [ ] README.md exists and is current
- [ ] STANDARDS.md exists and reflects applied standards

## Agent Skills (Cross-Agent Standard)

Skills are portable, on-demand instruction packages that extend agent capabilities. Unlike steering/system prompts (always active), skills activate when the model detects relevance or when invoked via `/skills`.

**Standard format** — same `SKILL.md` across all CLIs (Kiro, Claude Code, Gemini, Copilot, Qwen, Codex):

```yaml
---
name: skill-name
description: When and how to use this skill
---

# Instructions

Step-by-step workflow here.
```

**Structure:**
```
skill-name/
├── SKILL.md           # Required — YAML frontmatter + instructions
└── references/        # Optional — supporting docs
```

**Locations:**

| Scope | Path |
|-------|------|
| Personal (all projects) | `~/.kiro/skills/`, `~/.claude/skills/`, `~/.gemini/skills/`, `~/.copilot/skills/`, `~/.qwen/skills/`, `~/.codex/skills/` |
| Project-specific | `.kiro/skills/`, `.claude/skills/`, `.gemini/skills/`, `.copilot/skills/`, `.qwen/skills/`, `.codex/skills/` |

**Our skills** (in `~/Documentos/prompts/skills/`, distributed by `update-agents.sh`):
- `deploy` — Remote deployment workflow (git pull, restart, health check)
- `code-review` — Code quality and security checklist
- `db-migrate` — Database migration workflow with rollback
- `ui-validate` — Screenshot validation at 3 viewports in `debug/`

**Skills vs Guides:**
- **Guides** (`PYTHON.MD`, `REACT.MD`) = always-on system prompt, global standards
- **Skills** = on-demand workflows, actionable steps, can include scripts

## Specialized Guides

**MANDATORY: Always read and apply the relevant specialized guide based on the project's language/framework.** For example: working on a Python project → read PYTHON.MD. React frontend → read REACT.MD + TYPESCRIPT.MD. These guides contain language-specific patterns, tooling, and standards that complement this file.

All guides are located in `~/Documentos/prompts/` on every node (local and remote).

- **AGENTS_CONFIG.md** — Agent configs, MCP settings, prompt locations
- **MCP_TOOLS.md** — MCP tools (Context7, Mem0, Playwright, GitLab, etc.)
- **TASK_MANAGEMENT.md** — Issue workflow, code review standards
- **CICD.md** — Pipeline monitoring, changelog generation, monitoring/alerting
- **MONITORING.MD** — Health checks, structured logging, metrics, alerting
- **SECURITY.md** — Secrets management, dependency scanning, supply chain security
- **UI_TESTING.md** — Playwright + DevTools, performance budgets
- **GENERAL.MD** — API design standards, cross-cutting concerns
- **PYTHON.MD** / **TYPESCRIPT.MD** / **GO.MD** / **RUST.MD** / **JAVA.MD** — Language guides
- **REACT.MD** / **REACT_NATIVE.MD** / **ANGULAR.MD** — Framework guides
- **DOCKER.MD** — Multi-stage builds, container security, optimization
- **EDA.MD** / **BDS.MD** / **LLM.MD** — Architecture patterns
- **TESTING_ADV.MD** / **TROUBLESHOOTING.MD** — Testing & debugging

---

**Last Updated**: 2026-04-16
**Maintained By**: Alfonso de la Guarda
**Total Agents**: 26 (19 local + 7 IDE extensions + 5 remote)
**MCP Servers**: 9 functional
