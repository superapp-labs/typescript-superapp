# CRITICAL SECURITY — NEVER COMMIT SECRETS

**Before every commit:** scan all staged files for API keys, passwords, tokens, private keys, credentials, connection strings, .env values. If found, abort the commit and warn the Chief.
---

# Development Guidelines

- Feature-based architecture (`src/features/`)
- Central logger (`import { logger } from '@core/utils/logger'`) — never raw `console.log`
- KISS, YAGNI, SOLID — no over-engineering
- One function per file, named after the function
- No dead code — remove, don't deprecate
- Avoid file conflicts — never assign two devs to the same file
- NEVER use `EnterPlanMode` unless Chief explicitly requests it
- Commit as often as possible — after every meaningful change, commit immediately so the Chief can review progress
- NEVER push to remote unless the user explicitly asks — always let the supervisor review commits first
- Do NOT start Playwright browser unless necessary or explicitly requested by Chief

# Project Documentation

- All project documentation lives in `docs-site/content/` (MDX files)
- **Read docs first** when you need to understand app context, architecture, or feature behavior
- **Update docs** whenever integrating new features or making changes to the app — keep documentation in sync with the codebase
