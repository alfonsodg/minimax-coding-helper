# GitHub Copilot Instructions

## Project Overview
This project follows the AI Agents Guide principles for consistent development practices.

## Development Guidelines

### Language Standards
- Code, comments, and documentation: **English only**
- Commit messages: **English only** using conventional commits format
- Use descriptive, self-documenting names
- Comments should explain "why" not "what"

### Core Principles
- **No Hacks**: Never use hardcoded values, hacks, or workarounds - always implement proper solutions
- **Modify First**: Always modify existing files before creating new ones
- **Stable Packages**: Use stable and latest versions, avoid beta/alpha unless explicitly requested

### Workflow Requirements
- **ALWAYS** create GitLab issues for tasks (or GitHub if project uses GitHub)
- **ALWAYS** commit with clear messages after completing tasks
- **ALWAYS** verify changes before declaring completion

### Commit Format
```
<type>(<scope>): <subject>

<body>

Closes #<issue-number>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Architecture
- Keep infrastructure simple and minimal by default
- Monitoring tools (Prometheus, Grafana) are **OPTIONAL** - only add if requested
- Docker/Docker Compose are **OPTIONAL** - only use if requested

### Task Completion
- Complete entire tasks autonomously without asking for confirmation at each step
- Make all necessary decisions independently
- Work through errors and find solutions
- Only ask for confirmation when:
  - Deleting files outside project directory
  - Making changes to production systems
  - Modifying critical infrastructure

### Integration Requirements
- Use GitLab by default (GitHub only if project has GitHub remote or explicitly requested)

For complete guidelines, refer to the main AGENTS.md file in the project documentation.
