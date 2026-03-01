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
- **Page index:** see [`docs-site/PAGE_INDEX.md`](docs-site/PAGE_INDEX.md) for a full list of all 79 doc pages with one-line descriptions
- **Keep the index in sync:** when adding, removing, or renaming any MDX page, run `node docs-site/scripts/generate-page-index.mjs`
- **Read docs first** when you need to understand app context, architecture, or feature behavior
- **Update docs** whenever integrating new features or making changes to the app — keep documentation in sync with the codebase

# SDK 
- it's mandatory to analyse carefully every sdk decision, compare pro and cons, find alternative solutions and let the user choice the best solution

# Developer Experience (DX)

## Core principle: value = clarity, not features

- **One way to do things.** Two ways? Pick the better one, delete the other.
- **Defaults over configuration.** Ship opinionated defaults. Advanced users can override.
- **Thin core, pluggable edges.** Databases, auth, HTTP adapters are plugins — not built-ins.
- **Typed end-to-end.** Schema → queries → rows → permission-scoped results.

## Product thinking

- **Subtract, don't add.** Each iteration should have fewer elements, not more.
- **Solve one problem at 10/10** instead of ten problems at 6/10.
- **Define by what it does NOT do.** Constraints create clarity.
- **Work backward from the experience.** Start with what the dev should feel, then engineer it.
- **If they hesitate, the design is wrong.** A dev should instantly know what to do.
