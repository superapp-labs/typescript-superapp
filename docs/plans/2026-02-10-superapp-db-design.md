# @superapp/db + @superapp/backend — Design Document

## Overview

A thin, secure data access layer that sits between any database and any frontend. Connects to multiple databases via DuckDB, enforces role-based row-level security with automatic WHERE clause injection, and exposes a type-safe SDK for frontends to safely query data.

**Core principle:** As thin as possible, but modular, secure, and extensible.

**Two packages (pnpm workspace):**
- **`@superapp/db`** — Client SDK (open-source). Type-safe query builder, auth UI components. Zero server dependencies.
- **`@superapp/backend`** — Server engine (private). DuckDB, permission engine, admin UI, CLI. Depends on `@superapp/db` for shared query protocol types.

```
Frontend (any framework)
  │
  └─ @superapp/db (type-safe query builder, no SQL) ← open-source client
       │
       │  HTTP + JWT (structured JSON query, never raw SQL)
       │
       └─ @superapp/backend (Hono / Next.js / Express / any adapter) ← private server
            │
            ├─ Auth provider (modular, swappable)
            │    └─ resolveSession(token) → $user object
            │
            ├─ Permission engine (CASL + Kysely)
            │    ├─ Check table/column/operation access
            │    ├─ Inject WHERE clauses (filter)
            │    ├─ Validate writes (check)
            │    ├─ Auto-set values (preset)
            │    └─ FK relationship validation
            │
            ├─ Audit logger
            │    └─ Query, params, duration, userId, IP, correlation_id
            │
            └─ DuckDB (ephemeral instance per session, pooled)
                 ├─ ATTACH postgres (native, least-privilege credentials)
                 ├─ ATTACH mysql (native, least-privilege credentials)
                 ├─ ATTACH sqlite (native)
                 └─ Custom providers (HTTP, gRPC, etc.)
```

---

## Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| Query engine | DuckDB | Embedded, fast, ATTACH to postgres/mysql/sqlite, full CRUD support |
| Server framework | Hono (default adapter) | Lightweight, edge-compatible, TypeScript |
| App database | Turso (libSQL) + Drizzle ORM | Projects, users, roles, permissions, audit logs — embedded locally or hosted via Turso |
| Auth | better-auth (default, swappable) | JWT-based, modular provider interface |
| Permission engine | CASL (@casl/ability) | Battle-tested permission checking, MongoDB-style operators |
| Query builder | Kysely | Type-safe SQL generation, used on both client and server |
| Admin UI | React + Vite | Permission editor, query audit, integrations management |
| UI framework | shadcn/ui + Radix UI | Modern, accessible, composable components built on Tailwind |
| Styling | Tailwind CSS 4 | Utility-first, consistent design tokens, dark mode built-in |
| Data tables | TanStack Table | Headless, virtualized, sortable/filterable data grids |
| Forms | React Hook Form + zod | Type-safe forms with JSON schema validation |
| Charts | Recharts | Lightweight charts for dashboard sparklines |
| JSON editor | Monaco Editor (@monaco-editor/react) | Autocomplete, validation, type inference for permission JSON |
| Icons | Lucide React | Consistent, clean icon set matching shadcn/ui |
| Schema validation | ajv | Runtime JSON schema validation |
| Testing | Vitest + Playwright | Unit/integration (Vitest), E2E (Playwright), containers (testcontainers) |
| CLI | Built-in (`@superapp/backend`) | `npx @superapp/backend generate` for TypeScript type generation |

---

## Design System

### Design Philosophy

Inspired by Linear, Vercel, and PlanetScale. Clean, data-dense, zero visual noise. Every pixel earns its place.

**Principles:**
- **Data-first**: Tables, code, and numbers are the content — the UI frames them, never competes.
- **Keyboard-navigable**: Power users never leave the keyboard. Command palette (Cmd+K), shortcuts everywhere.
- **Dark mode native**: Designed dark-first, light mode is the adaptation.
- **Density toggle**: Compact mode for power users, comfortable mode for everyone else.

### Color Palette

Tailwind CSS 4 with custom CSS variables for theming:

```
── Brand ────────────────────────────────────────────────
Primary          Indigo-500  #6366f1    Buttons, links, active states
Primary hover    Indigo-400  #818cf8    Hover states
Primary subtle   Indigo-950  #1e1b4b    Backgrounds with brand tint (dark)
                 Indigo-50   #eef2ff    Backgrounds with brand tint (light)

── Neutrals (Slate) ─────────────────────────────────────
Background       Slate-950   #020617    App background (dark)
                 White       #ffffff    App background (light)
Surface          Slate-900   #0f172a    Cards, panels, sidebar (dark)
                 Slate-50    #f8fafc    Cards, panels, sidebar (light)
Border           Slate-800   #1e293b    Dividers, card borders (dark)
                 Slate-200   #e2e8f0    Dividers, card borders (light)
Text primary     Slate-50    #f8fafc    Headings, body text (dark)
                 Slate-900   #0f172a    Headings, body text (light)
Text secondary   Slate-400   #94a3b8    Labels, descriptions, meta
Text muted       Slate-500   #64748b    Placeholders, disabled

── Semantic ─────────────────────────────────────────────
Success          Emerald-500 #10b981    Connected, active, granted
Warning          Amber-500   #f59e0b    Filtered queries, attention
Error            Rose-500    #f43f5e    Denied, disconnected, errors
Info             Sky-500     #0ea5e9    Tips, info badges

── Permission-specific ──────────────────────────────────
Select           Sky-400     #38bdf8    Read operations
Insert           Emerald-400 #34d399    Create operations
Update           Amber-400   #fbbf24    Update operations
Delete           Rose-400    #fb7185    Delete operations
Relationship     Violet-400  #a78bfa    FK traversal, joins
Dynamic value    Amber-300   #fcd34d    $user.* variables (key icon)
```

### Typography

```
Font stack:
  UI text:    Inter (variable)       — clean, readable at all sizes
  Monospace:  JetBrains Mono         — code, SQL, JSON, column names

Sizes (Tailwind scale):
  Page title:     text-xl    font-semibold     tracking-tight
  Section title:  text-base  font-medium
  Body:           text-sm    font-normal        (default)
  Label:          text-xs    font-medium        text-secondary  uppercase  tracking-wider
  Code inline:    text-sm    font-mono          bg-surface  px-1.5  py-0.5  rounded
  SQL preview:    text-sm    font-mono          leading-relaxed
```

### Spacing & Layout

```
Sidebar:        w-56 (224px)       fixed, collapsible to w-14 (56px icons only)
Content area:   max-w-6xl          centered with px-8 padding
Card:           rounded-lg         border border-border  bg-surface
Card padding:   p-6
Section gap:    space-y-6
Inline gap:     gap-3
```

### Component Patterns (shadcn/ui)

**Buttons:**
```
Primary:     bg-primary text-white hover:bg-primary-hover
Secondary:   bg-surface border border-border hover:bg-slate-800
Ghost:       hover:bg-slate-800 text-secondary
Danger:      bg-rose-500/10 text-rose-400 hover:bg-rose-500/20
```

**Cards:**
```
Default:     bg-surface border border-border rounded-lg
Interactive: hover:border-primary/50 cursor-pointer transition
Selected:    border-primary ring-1 ring-primary/20
```

**Badges (permission status):**
```
Granted:     bg-emerald-500/10 text-emerald-400 border-emerald-500/20
Denied:      bg-rose-500/10 text-rose-400 border-rose-500/20
Filtered:    bg-amber-500/10 text-amber-400 border-amber-500/20
Read-only:   bg-slate-500/10 text-slate-400 border-slate-500/20
```

**Tables (TanStack Table):**
```
Header:      bg-slate-900/50  text-xs  uppercase  tracking-wider  text-secondary
Row:         border-b border-border  hover:bg-slate-800/50
Row alt:     no striping (clean look)
Cell:        py-3 px-4 text-sm
Selected:    bg-primary/5 border-l-2 border-l-primary
```

**Code/SQL blocks:**
```
Container:   bg-slate-950 rounded-lg border border-border font-mono text-sm
Line numbers:text-slate-600 select-none pr-4 border-r border-border
Keywords:    text-sky-400        (SELECT, FROM, WHERE, AND)
Strings:     text-emerald-400    ('active', "name")
Numbers:     text-amber-400      (1000, 0.5)
Parameters:  text-violet-400     ($1, $2, :user_id)
Comments:    text-slate-500      (-- injected by permission)
```

### Admin UI Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  ┌──────┐  superapp           Project: Acme Corp ▾   ▪ ▪ alice  │
│  │ logo │  ─────────────────────────────────────────  ⌘K search  │
├──┴──────┴────┬───────────────────────────────────────────────────┤
│              │                                                    │
│  Dashboard   │   Page title                                      │
│  Get Started │   Description text in muted color                  │
│  Integrations│                                                    │
│              │   ┌─ Card ──────────────────────────────────────┐  │
│  Explorer    │   │                                             │  │
│              │   │  Content area                               │  │
│  Auth        │   │                                             │  │
│              │   └─────────────────────────────────────────────┘  │
│  Roles       │                                                    │
│              │   ┌─ Card ──────────────────────────────────────┐  │
│  Permissions │   │                                             │  │
│              │   │  Content area                               │  │
│  Users       │   │                                             │  │
│              │   └─────────────────────────────────────────────┘  │
│  Audit Log   │                                                    │
│              │                                                    │
│  Settings    │                                                    │
│              │                                                    │
│  ──────────  │                                                    │
│  ⌘K Search   │                                                    │
│  ? Help      │                                                    │
└──────────────┴────────────────────────────────────────────────────┘
```

**Sidebar:**
- Active item: `bg-primary/10 text-primary border-l-2 border-l-primary`
- Hover: `bg-slate-800/50`
- Icons from Lucide: Database, Search, Shield, Users, ScrollText, Settings, etc.
- Collapsible: Cmd+B toggles between full sidebar and icon-only mode

**Command palette (Cmd+K):**
- shadcn/ui `<CommandDialog>` (built on cmdk)
- Search across: pages, tables, roles, permissions, users, recent queries
- Keyboard-first navigation

### Permission Editor — Visual Builder Styling

**Condition pills:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  bg-surface rounded-lg border border-border p-3                  │
│  hover:border-slate-600 transition group                         │
│                                                                  │
│  ≡  🔵 status      equals      "active"                    ✕    │
│  │   ↑              ↑            ↑                          ↑    │
│  │  text-sky-400   text-muted   text-emerald-400       opacity-0│
│  │  font-mono      text-sm      font-mono              group-   │
│  │  cursor-pointer              cursor-pointer         hover:   │
│  │  hover:bg-sky   cursor-pointer hover:bg-emerald     opacity  │
│  │  -400/10                     -400/10                -100     │
│  │                                                               │
│  drag handle (slate-600, hover:slate-400)                        │
└─────────────────────────────────────────────────────────────────┘
```

**Relationship path:**
```
🔗 through   orders  →  organization  →  members
              ↑          ↑                ↑
           text-sm     text-violet-400   text-violet-400
           text-muted  font-mono         font-mono
                       bg-violet-400/10  bg-violet-400/10
                       px-2 py-0.5       px-2 py-0.5
                       rounded           rounded
```

**AND/OR groups:**
```
Container:  border-l-2 border-l-slate-700 pl-4 space-y-2
AND label:  text-xs uppercase tracking-wider text-slate-500 font-medium
OR label:   text-xs uppercase tracking-wider text-amber-500 font-medium
Switch:     cursor-pointer hover:text-primary
```

**Dynamic values ($user.*):**
```
Badge:      bg-amber-400/10 text-amber-300 font-mono text-sm
            px-2 py-0.5 rounded-md border border-amber-400/20
Icon:       Key icon (Lucide) w-3 h-3 inline mr-1
```

**Unified + palette:**
```
Trigger:    border border-dashed border-slate-700 rounded-lg
            hover:border-primary hover:bg-primary/5
            text-muted hover:text-primary text-sm
            py-2 px-3 transition cursor-pointer

Dropdown:   bg-surface border border-border rounded-lg shadow-xl
            w-80 max-h-80 overflow-y-auto

Search:     sticky top-0 bg-surface border-b border-border
            px-3 py-2 text-sm

Section:    text-xs uppercase tracking-wider text-muted
            px-3 py-1.5 font-medium

Item:       px-3 py-2 hover:bg-slate-800 cursor-pointer
            flex items-center gap-3
Column icon: text-sky-400
Relation icon: text-violet-400
Logic icon: text-slate-400
Type hint:  text-muted text-xs font-mono ml-auto
```

**SQL preview:**
```
Container:  bg-slate-950 rounded-lg border border-border
            font-mono text-sm leading-relaxed p-4
            max-h-48 overflow-y-auto

Row count:  float-right text-xs
            bg-emerald-500/10 text-emerald-400
            px-2 py-0.5 rounded-full
            "~47 rows match"
```

**Natural language summary:**
```
Container:  bg-slate-900/50 rounded-lg p-4 border border-border
Font:       text-sm text-secondary leading-relaxed
Highlights: text-primary font-medium (table names, column names)
```

### Dashboard Page

```
┌──────────────────────────────────────────────────────────────────┐
│  Dashboard                                                       │
│                                                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  │ Connections │ │ Queries/24h│ │ Denied/24h │ │ Users      │   │
│  │  3 active   │ │  12,847    │ │  23 ⚠      │ │  48        │   │
│  │  ~~~sparkline│ │  ~~sparkline│ │  ~sparkline │ │            │   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
│                                                                  │
│  Recent denied queries                           [View all →]   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  10:24  bob   main.payments  SELECT  ❌                    │  │
│  │  10:31  eve   main.orders    UPDATE  ❌                    │  │
│  │  11:02  bob   main.payments  SELECT  ❌                    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Queries by table (24h)               Queries by role (24h)      │
│  ┌──────────────────────┐            ┌──────────────────────┐   │
│  │  bar chart            │            │  bar chart            │   │
│  └──────────────────────┘            └──────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Getting Started Page

```
┌──────────────────────────────────────────────────────────────────┐
│  Getting Started                                                  │
│  Connect your app to @superapp/db                                 │
│                                                                   │
│  ┌─ Quick Start ─────────────────────────────────────────────┐   │
│  │                                                            │   │
│  │  Scaffold a Next.js app with auth, queries, and types      │   │
│  │  — all pre-configured.                                     │   │
│  │                                                            │   │
│  │  ┌─ code ──────────────────────────────────────── [Copy] ┐│   │
│  │  │ npx @superapp/backend create-app my-app                  ││   │
│  │  └────────────────────────────────────────────────────────┘│   │
│  │                                                            │   │
│  │  This generates a ready-to-run Next.js project with:       │   │
│  │  ✓ Auth (login, signup, user menu)                         │   │
│  │  ✓ Typed query client pointed to this engine               │   │
│  │  ✓ Generated schema types (dev token pre-configured)       │   │
│  │  ✓ Tailwind + shadcn/ui                                    │   │
│  │                                                            │   │
│  │  ┌─ code ──────────────────────────────────────── [Copy] ┐│   │
│  │  │ cd my-app && npm run dev                               ││   │
│  │  └────────────────────────────────────────────────────────┘│   │
│  │                                                            │   │
│  │  Open http://localhost:3000 — sign up, then query data.    │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─ Manual Integration (existing project) ────── [▸ Expand] ─┐   │
│  │                                                            │   │
│  │  ┌─ 1 ─ Install ─────────────────────────────────────────┐│   │
│  │  │ pnpm add @superapp/db                                  ││   │
│  │  └────────────────────────────────────────────────────────┘│   │
│  │                                                            │   │
│  │  ┌─ 2 ─ Add authentication ──────────────────────────────┐│   │
│  │  │                                                        ││   │
│  │  │  [Next.js] [React Router] [Vite]    ← framework tabs  ││   │
│  │  │                                                        ││   │
│  │  │  // lib/auth.ts                                        ││   │
│  │  │  import { createAuth } from '@superapp/db/auth'        ││   │
│  │  │  export const authClient = createAuth(SUPERAPP_URL)    ││   │
│  │  │                                                        ││   │
│  │  │  // app/layout.tsx                                     ││   │
│  │  │  <AuthProvider authClient={authClient} navigate={…}>   ││   │
│  │  │    {children}                                          ││   │
│  │  │  </AuthProvider>                                       ││   │
│  │  │                                                        ││   │
│  │  │  // app/auth/[[...slug]]/page.tsx                      ││   │
│  │  │  <AuthCard />                                          ││   │
│  │  │                                                        ││   │
│  │  │  // components/navbar.tsx                              ││   │
│  │  │  <UserButton />                                        ││   │
│  │  └────────────────────────────────────────────────────────┘│   │
│  │                                                            │   │
│  │  ┌─ 3 ─ Generate types ──────────────────────────────────┐│   │
│  │  │  Create a token in [Settings], then:                   ││   │
│  │  │  npx @superapp/backend generate --token <token>          ││   │
│  │  └────────────────────────────────────────────────────────┘│   │
│  │                                                            │   │
│  │  ┌─ 4 ─ Query data ─────────────────────────────────────┐│   │
│  │  │  import { createClient } from '@superapp/db'           ││   │
│  │  │  import type { Schema } from './generated/schema'      ││   │
│  │  │                                                        ││   │
│  │  │  const db = createClient<Schema>({                     ││   │
│  │  │    url: SUPERAPP_URL + '/data',                        ││   │
│  │  │    userToken: jwt,                                     ││   │
│  │  │  })                                                    ││   │
│  │  │                                                        ││   │
│  │  │  const orders = await db.main.orders.findMany({        ││   │
│  │  │    where: { status: 'active' },                        ││   │
│  │  │    include: { customer: ['name'] },                    ││   │
│  │  │  })                                                    ││   │
│  │  └────────────────────────────────────────────────────────┘│   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─ Context-aware nudge ─────────────────────────────────────┐   │
│  │  ⚠ No database connections yet. [Add your first →]         │   │
│  └────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Responsive Behavior

```
Desktop (>1280px):  Full sidebar + content
Tablet (768-1280):  Collapsed sidebar (icons) + content
Mobile (<768):      Hidden sidebar (hamburger menu) + full-width content
```

---

## Package Structure

pnpm workspace monorepo with two packages. The client (`@superapp/db`) is independently publishable and open-sourceable. The server (`@superapp/backend`) is private and depends on the client for shared query protocol types.

```
superapp-backend/                          (workspace root)
├── pnpm-workspace.yaml               packages: ['packages/*']
├── package.json                       workspace scripts, devDependencies
├── tsconfig.base.json                 shared compiler options
│
├── packages/
│   ├── db/                        ← @superapp/db (client — open-source)
│   │   ├── package.json               name: "@superapp/db"
│   │   ├── tsconfig.json               extends ../../tsconfig.base.json
│   │   └── src/
│   │       ├── index.ts                 createClient, query types, operators
│   │       ├── auth.ts                  Auth client factory (→ /auth endpoint)
│   │       ├── schemaLoader.ts          Dev-mode schema fetching
│   │       ├── components/
│   │       │   ├── index.ts             Barrel export
│   │       │   ├── auth-provider.tsx    AuthUIProvider wrapper (thin)
│   │       │   ├── auth-card.tsx        Re-export: sign-in / sign-up card
│   │       │   └── user-button.tsx      Re-export: user dropdown menu
│   │       └── types/
│   │           └── index.ts             Query protocol (QueryRequest, FilterOps, etc.)
│   │
│   └── backend/                    ← @superapp/backend (server — private)
│       ├── package.json               name: "@superapp/backend", "private": true
│       ├── tsconfig.json               extends ../../tsconfig.base.json
│       └── src/
│           ├── index.ts                 createEngine, main entry
│           ├── backend/
│           │   ├── createEngine.ts      Main entry point
│           │   ├── queryBuilder.ts      Structured query → Kysely → SQL
│           │   ├── permissions.ts       CASL integration, WHERE injection
│           │   ├── audit.ts             Query logging
│           │   └── schema.ts            Schema introspection from DuckDB
│           │
│           ├── auth/
│           │   ├── types.ts             AuthProvider interface
│           │   ├── better-auth.ts       Default: better-auth adapter
│           │   └── custom.ts            Helper for DIY providers
│           │
│           ├── integrations/
│           │   ├── types.ts             IntegrationProvider interface
│           │   ├── postgres.ts          Native DuckDB ATTACH
│           │   ├── mysql.ts             Native DuckDB ATTACH
│           │   ├── sqlite.ts            Native DuckDB ATTACH
│           │   ├── csv.ts               Read-only, native DuckDB
│           │   ├── parquet.ts           Read-only, native DuckDB
│           │   └── custom.ts            Helper for custom HTTP providers
│           │
│           ├── adapters/                (~30-50 lines each)
│           │   ├── hono.ts              createHonoMiddleware(engine)
│           │   ├── next.ts              createNextHandler(engine)
│           │   ├── express.ts           createExpressRouter(engine)
│           │   └── generic.ts           createHandler(engine) for any Request/Response
│           │
│           ├── admin/                   Admin UI (React, served as static assets)
│           │   ├── pages/
│           │   │   ├── dashboard.tsx
│           │   │   ├── getting-started.tsx
│           │   │   ├── integrations.tsx
│           │   │   ├── explorer.tsx
│           │   │   ├── authentication.tsx
│           │   │   ├── roles.tsx
│           │   │   ├── permissions.tsx
│           │   │   ├── users.tsx
│           │   │   ├── audit.tsx
│           │   │   └── settings.tsx
│           │   └── components/
│           │       ├── permission-editor/
│           │       │   ├── visual-builder.tsx
│           │       │   ├── json-editor.tsx
│           │       │   ├── custom-sql-editor.tsx
│           │       │   ├── condition-palette.tsx
│           │       │   ├── column-selector.tsx
│           │       │   └── sql-preview.tsx
│           │       └── ...
│           │
│           ├── db/                      App's own Turso (libSQL) database
│           │   ├── schema.ts            Drizzle schema
│           │   └── migrations/
│           │
│           ├── cli/
│           │   ├── generate.ts          TypeScript type generation
│           │   └── create-app.ts        Scaffold a Next.js project
│           │
│           └── templates/               create-app template (shipped in package)
│               └── nextjs/
│                   ├── app/
│                   │   ├── layout.tsx         Root layout with AuthProvider
│                   │   ├── page.tsx           Landing page
│                   │   ├── auth/
│                   │   │   └── [[...slug]]/
│                   │   │       └── page.tsx   AuthCard (sign-in/up/forgot)
│                   │   └── dashboard/
│                   │       └── page.tsx       Example query page
│                   ├── lib/
│                   │   ├── auth.ts            createAuth() pre-configured
│                   │   └── db.ts              createClient() pre-configured
│                   ├── components/
│                   │   ├── providers.tsx       AuthProvider + router wiring
│                   │   └── navbar.tsx          UserButton in header
│                   ├── generated/             (auto-populated by create-app)
│                   │   ├── schema.ts
│                   │   ├── sdk-docs.md
│                   │   └── sdk-docs.json
│                   ├── package.json           @superapp/db + next + react deps
│                   ├── tsconfig.json
│                   ├── next.config.ts
│                   ├── tailwind.config.ts
│                   └── .env.local             SUPERAPP_URL + SUPERAPP_DEV_TOKEN (gitignored)
```

**Dependency graph:**

```
@superapp/backend (private)
  ├─ depends on: @superapp/db (for query protocol types)
  ├─ depends on: duckdb, @casl/ability, kysely, drizzle-orm, hono, better-auth, ...
  └─ devDependencies: react, vite (admin UI build)

@superapp/db (open-source)
  ├─ depends on: better-auth (peer), react (peer)
  ├─ depends on: @daveyplate/better-auth-ui (peer)
  └─ zero server dependencies — safe to ship to browsers
```

**Subpath exports (`@superapp/db/package.json`):**

```json
{
  "name": "@superapp/db",
  "exports": {
    ".":            "./dist/index.js",
    "./auth":       "./dist/auth.js",
    "./components": "./dist/components/index.js",
    "./types":      "./dist/types/index.js"
  }
}
```

**Subpath exports (`@superapp/backend/package.json`):**

```json
{
  "name": "@superapp/backend",
  "private": true,
  "exports": {
    ".":                  "./dist/index.js",
    "./auth/better-auth": "./dist/auth/better-auth.js",
    "./integrations/*":   "./dist/integrations/*.js",
    "./adapters/*":       "./dist/adapters/*.js"
  },
  "bin": {
    "superapp-backend": "./dist/cli/index.js"
  }
}
```

**Imports — client (`@superapp/db`):**

```typescript
import { createClient }            from '@superapp/db'
import { createAuth }              from '@superapp/db/auth'
import { AuthProvider, AuthCard, UserButton }
                                   from '@superapp/db/components'
import type { QueryRequest, FilterOperators }
                                   from '@superapp/db/types'
```

**Imports — server (`@superapp/backend`):**

```typescript
import { createEngine }            from '@superapp/backend'
import { betterAuthProvider }      from '@superapp/backend/auth/better-auth'
import { postgresProvider }        from '@superapp/backend/integrations/postgres'
import { mysqlProvider }           from '@superapp/backend/integrations/mysql'
import { sqliteProvider }          from '@superapp/backend/integrations/sqlite'
import { csvProvider }             from '@superapp/backend/integrations/csv'
import { createHonoMiddleware }    from '@superapp/backend/adapters/hono'
import { createNextHandler }       from '@superapp/backend/adapters/next'
import { createExpressRouter }     from '@superapp/backend/adapters/express'
```

**CLI (shipped in `@superapp/backend`):**

```bash
# Scaffold a new Next.js project wired to this engine
npx @superapp/backend create-app my-app

# Generate TypeScript types from a running engine
npx @superapp/backend generate --token <schema_api_token>
```

**Workspace scripts (`root package.json`):**

```bash
pnpm dev           # dev both packages (client watch + engine dev server)
pnpm build         # build both packages
pnpm build:db      # build @superapp/db only
pnpm build:engine  # build @superapp/backend only
pnpm test          # test both packages
```

### `create-app` — Project Scaffolding

**Command:**

```bash
npx @superapp/backend create-app <name> [--url <engine_url>]
```

Copies the `templates/nextjs/` directory from the installed `@superapp/backend` package into `./<name>`, then:

1. **Writes `.env.local`** — Sets `NEXT_PUBLIC_SUPERAPP_URL` to the engine URL (from `--url` flag, or prompts interactively). Sets `SUPERAPP_DEV_TOKEN` to a one-time dev token auto-provisioned via the engine's admin API.
2. **Runs `npx @superapp/backend generate`** — Uses the dev token to introspect the engine and generate `generated/schema.ts`, `generated/sdk-docs.md`, `generated/sdk-docs.json` inside the new project.
3. **Runs `pnpm install`** — Installs all dependencies (including `@superapp/db` from npm).
4. **Prints next steps** — `cd <name> && pnpm dev`, open `http://localhost:3000`.

**Why ship the template inside `@superapp/backend`:**

- The template references `@superapp/db` (the client) which is published to npm independently — no version coupling between template and client.
- The CLI (`create-app`, `generate`) needs engine access (admin API for dev tokens, `/schema` endpoint for introspection) — so it lives in the engine package.
- The scaffolded project depends only on `@superapp/db` (the open-source client). No dependency on `@superapp/backend`.

**What the scaffolded project contains:**

```
my-app/
├── app/
│   ├── layout.tsx                 Root layout → <AuthProvider>
│   ├── page.tsx                   Landing page (signed-out: hero, signed-in: redirect)
│   ├── auth/
│   │   └── [[...slug]]/
│   │       └── page.tsx           <AuthCard /> — handles sign-in, sign-up, forgot-password
│   └── dashboard/
│       └── page.tsx               Example query page using createClient
├── lib/
│   ├── auth.ts                    createAuth(NEXT_PUBLIC_SUPERAPP_URL)
│   └── db.ts                      createClient<Schema>({ url, userToken })
├── components/
│   ├── providers.tsx               AuthProvider + router wiring
│   └── navbar.tsx                  <UserButton /> in header
├── generated/
│   ├── schema.ts                   Auto-generated TypeScript types
│   ├── sdk-docs.md                 Auto-generated human + AI docs
│   └── sdk-docs.json               Auto-generated machine-readable schema
├── package.json                    depends on @superapp/db (client only)
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── .env.local                      NEXT_PUBLIC_SUPERAPP_URL + SUPERAPP_DEV_TOKEN
```

**Template file sizes:** Each file is minimal — `lib/auth.ts` is ~3 lines, `lib/db.ts` is ~8 lines, `providers.tsx` is ~15 lines. The largest file is `dashboard/page.tsx` (~30 lines) showing a sample `findMany` query with a table rendered via TanStack Table.

---

## Integration Providers

Two types of providers: native (DuckDB ATTACH) and custom (any transport).

```typescript
/**
 * Base interface for all integration providers.
 * Providers are modular — register only what you need.
 */
interface IntegrationProvider<TConfig = Record<string, unknown>> {
  /** Unique provider type identifier */
  readonly type: string
  /** Display name shown in admin UI */
  readonly displayName: string
  /** Icon identifier for admin UI */
  readonly icon: string
  /** Supported operations — read-only providers set insert/update/delete to false */
  readonly capabilities: {
    readonly read: boolean
    readonly insert: boolean
    readonly update: boolean
    readonly delete: boolean
  }
  /** JSON schema for the config form rendered in admin UI */
  readonly configSchema: JSONSchema7

  /** Validate and test the connection. Error is sanitized (no raw DB errors to client). */
  testConnection(config: TConfig): Promise<{ ok: boolean; error?: string }>
  /** Discover tables, columns, types, foreign keys. Only returns tables the engine manages. */
  introspect(config: TConfig): Promise<SchemaInfo>
}

/**
 * Native provider — runs inside DuckDB via ATTACH.
 * Best performance. Used when DuckDB runtime is available.
 */
interface NativeIntegrationProvider<TConfig> extends IntegrationProvider<TConfig> {
  readonly transport: 'native'
  /** Returns DuckDB ATTACH statement */
  attach(config: TConfig): Promise<{ sql: string; params: unknown[] }>
  /** Optional: teardown on disconnect */
  detach?(name: string): Promise<void>
}

/**
 * Custom provider — executes queries over any transport.
 * Used for: HTTP APIs, non-SQL sources, edge runtimes (Workers).
 */
interface CustomIntegrationProvider<TConfig> extends IntegrationProvider<TConfig> {
  readonly transport: 'custom'
  /** Execute a compiled query and return results */
  execute(query: CompiledQuery, config: TConfig): Promise<QueryResult>
}
```

**Built-in providers:**

| Provider | Type | Transport | Read | Write |
|----------|------|-----------|------|-------|
| postgres | PostgreSQL | native (DuckDB ATTACH) | yes | yes |
| mysql | MySQL | native (DuckDB ATTACH) | yes | yes |
| sqlite | SQLite | native (DuckDB ATTACH) | yes | yes |
| csv | CSV Files | native (DuckDB read_csv) | yes | no |
| parquet | Parquet Files | native (DuckDB read_parquet) | yes | no |

**Custom provider example (Cloudflare Workers + Neon HTTP):**

```typescript
const neonHttpProvider: CustomIntegrationProvider<{ url: string }> = {
  type: 'neon-http',
  displayName: 'Neon (HTTP)',
  icon: 'neon',
  transport: 'custom',
  capabilities: { read: true, insert: true, update: true, delete: true },
  configSchema: {
    type: 'object',
    properties: { url: { type: 'string', title: 'Neon Connection URL' } },
    required: ['url'],
  },
  async testConnection(config) { /* ... */ },
  async introspect(config) { /* ... */ },
  async execute(query, config) { /* ... */ },
}
```

**Engine routes queries based on provider transport:**

```
engine.execute(query, userContext)
  │
  ├─ connection "main" → postgresProvider (native)
  │   → DuckDB ATTACH → DuckDB executes SQL directly
  │
  ├─ connection "edge_db" → neonHttpProvider (custom)
  │   → Provider builds HTTP request → Neon serverless API
  │
  └─ connection "wiki" → notionProvider (custom)
      → Provider translates query → Notion REST API
```

---

## Authentication

Auth providers are fully self-contained black boxes. The engine calls ONE method: `resolveSession(token)`. Everything else (JWT verification, user loading, enrichment) is internal to the provider.

```typescript
/**
 * AuthProvider interface. Providers handle everything:
 * token verification, user loading, active checks, session enrichment.
 *
 * The engine never touches auth internals.
 */
interface AuthProvider {
  /**
   * Given a raw token string, return the full user session.
   *
   * Throw UnauthorizedError if token is invalid or user is inactive.
   * Implementations MUST use constant-time comparison for token/signature
   * verification to prevent timing attacks.
   *
   * @param token - Raw token from Authorization header
   * @param db - Kysely query builder for all connected databases
   * @returns UserSession — becomes $user.* in permission filters.
   *          Must include at minimum: { id: string }
   *          roles[] and permissions[] are auto-injected by the engine
   *          AFTER resolveSession returns.
   */
  resolveSession(token: string, db: Kysely<any>): Promise<UserSession>

  /**
   * JSON schema describing the shape of $user (after resolveSession).
   * Used by the permission editor for $user.* autocomplete.
   * Used by the CLI for TypeScript type generation.
   */
  sessionSchema: JSONSchema7

  /**
   * JSON schema for the provider's config form in admin UI.
   * Each provider renders its own configuration UI.
   */
  configSchema: JSONSchema7
}
```

**better-auth provider (default):**

```typescript
import { betterAuthProvider } from '@superapp/backend/auth/better-auth'

const auth = betterAuthProvider({
  secret: process.env.AUTH_SECRET!,

  userTable: {
    table: 'main.users',
    matchOn: { column: 'id', jwtField: 'id' },
    activeCheck: { column: 'is_active', value: true },
    columns: ['id', 'email', 'name'],
  },

  resolveSession: async (user, db) => {
    const memberships = await db
      .selectFrom('main.members')
      .select(['organization_id', 'role'])
      .where('user_id', '=', user.id)
      .where('status', '=', 'active')
      .execute()

    return {
      ...user,
      org_ids: memberships.map(m => m.organization_id),
      org_roles: memberships,
    }
  },
})
```

**Active Directory provider (no DB lookup needed):**

```typescript
const auth = activeDirectoryProvider({
  tenantId: process.env.AD_TENANT!,
  clientId: process.env.AD_CLIENT!,

  async resolveSession(adUser) {
    return {
      id: adUser.oid,
      email: adUser.email,
      name: adUser.displayName,
      org_ids: adUser.groups,
      department: adUser.department,
    }
  },
})
```

**Custom provider:**

```typescript
const auth: AuthProvider = {
  sessionSchema: { /* JSON schema for $user */ },
  configSchema: { /* JSON schema for admin UI form */ },

  async resolveSession(token, db) {
    const payload = await myCustomVerify(token)
    const user = await myCustomUserLoader(payload.sub)
    if (!user.active) throw new UnauthorizedError('User inactive')
    return { id: user.id, email: user.email, org_ids: user.organizations }
  },
}
```

**Request pipeline:**

```
Token arrives
  │
  ├─ 1. engine calls: auth.resolveSession(token, db)
  │      (provider handles everything internally)
  │      → returns: { id, email, name, org_ids, org_roles, ... }
  │
  ├─ 2. engine auto-injects roles[] and permissions[] from its own DB
  │      (user.id → user_roles → roles → role_permissions)
  │
  └─ 3. final $user object:
         {
           id: "usr_abc",
           email: "alice@acme.com",        ← from provider
           name: "Alice",                  ← from provider
           org_ids: ["org_1", "org_2"],    ← from provider
           org_roles: [...],               ← from provider
           roles: ["editor", "analyst"],   ← auto-injected by engine
           permissions: ["view_own_orders"] ← auto-injected by engine
         }
```

---

## Permission Model

Permissions are reusable objects with name, slug, and description. They can be shared across roles. Follows Hasura/PostgreSQL RLS semantics with MongoDB-style operators (CASL).

**Slug format:** Permission slugs use **underscores only** (snake_case). Examples: `view_own_orders`, `edit_org_orders`, `delete_draft_orders`. Validated with regex: `/^[a-z][a-z0-9_]*$/`.

### Operators (MongoDB-style, CASL-native)

```
{ $eq: value }         { $ne: value }
{ $gt: value }         { $gte: value }
{ $lt: value }         { $lte: value }
{ $in: [values] }      { $nin: [values] }
{ $exists: boolean }
{ $regex: pattern }     (max 200 chars, no backtracking — validated with safe-regex before execution)
{ $and: [conditions] } { $or: [conditions] }  { $not: condition }
```

### CRUD Mapping (aligned with PostgreSQL RLS)

| Field | select | insert | update | delete |
|-------|--------|--------|--------|--------|
| `columns` | Which columns are returned | Which columns can be set | Which columns can be modified | n/a |
| `filter` | Which rows are visible (USING) | n/a | Which existing rows can be updated (USING) | Which rows can be deleted (USING) |
| `check` | n/a | Validates new row (WITH CHECK) | Validates updated row (WITH CHECK) | n/a |
| `preset` | n/a | Auto-set values on insert | Auto-set values on update | n/a |
| `limit` | Max rows returned | n/a | n/a | n/a |

### Relationship Traversal in Filters

Filters can traverse FK relationships up to `maxFilterDepth` levels (default: 5) to reach the user identity. Deeper traversals are rejected at query time with `400 Bad Request`.

```typescript
// orders → organization → members → user_id
filter: {
  organization: {
    members: {
      user_id: { $eq: '$user.id' },
      role: { $in: ['owner', 'admin'] },
    },
  },
}
```

Generates:

```sql
WHERE EXISTS (
  SELECT 1 FROM main.organizations org
  WHERE org.id = orders.organization_id
  AND EXISTS (
    SELECT 1 FROM main.members m
    WHERE m.organization_id = org.id
    AND m.user_id = $1
    AND m.role IN ($2, $3)
  )
)
```

### `$user.*` Variable Safety

Dynamic `$user.*` references in filters, check, and preset are validated at two stages:

1. **On permission save:** Every `$user.*` path is validated against the auth provider's `sessionSchema`. Unknown paths are rejected — e.g., if `sessionSchema` defines `{ id, email, org_ids }`, then `$user.foo` is a save-time error.
2. **On query execution:** Only scalar values (`string`, `number`, `boolean`) and arrays of scalars (`string[]`, `number[]`) are substituted. Objects, nested structures, `null`, and `undefined` are rejected at runtime with a `500 Internal Server Error` (never exposed to the client). This prevents operator injection via crafted session objects.

### Relationship Handling — Zero Config

If a user has `select` permission on both `main.orders` and `main.customers`, relationships work automatically. Each table's own filter applies independently.

If a user does NOT have access to a related table, including it is rejected.

### FK Validation on Writes

When writing a FK column (e.g., `customer_id`), the engine checks if the user can SELECT from the target table where `id` equals the value being written. If the target row isn't in the user's permitted rows, the write is rejected.

### Custom SQL Permissions

Power users can write raw SQL WHERE clauses with parameterized values. Custom SQL runs **inside the user's isolated DuckDB session instance** — it can only access ATTACHed project databases, never the app database (Turso), filesystem, or other projects.

```typescript
'advanced_reporting': {
  name: 'Advanced reporting access',
  table: 'main.orders',
  operations: { select: true },
  columns: '*',
  customSql: {
    where: 'organization_id IN (SELECT org_id FROM reporting_access WHERE user_id = :user_id AND level >= :min_level)',
    params: { user_id: '$user.id', min_level: 3 },
  },
}
```

**Validation on save (admin UI or programmatic):**
- All params must be named (`:param_name`) — positional params (`$1`) are rejected
- Each `:param_name` must map to a `$user.*` variable or a static literal in the `params` object
- SQL is parsed through a lightweight SQL parser to reject: `UNION`, `INSERT`, `UPDATE`, `DELETE`, `DROP`, `CREATE`, `ALTER`, `ATTACH`, `COPY`, `LOAD`, function calls outside an allowlist (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `COALESCE`, `NULLIF`, `CASE`)
- Max custom SQL length: 2,000 characters
- Every custom SQL permission creation/modification is logged to `audit_logs` with `action: 'admin_permission_custom_sql'`

### Programmatic Mode Example

```typescript
import { createEngine } from '@superapp/backend'
import type { SuperAppSchema } from './generated/schema'

const engine = createEngine<SuperAppSchema>({
  mode: 'programmatic',
  database: process.env.TURSO_URL ?? './superapp.db',

  integrations: [postgresProvider, mysqlProvider],
  connections: {
    main: { type: 'postgres', url: process.env.PG_URL! },
    warehouse: { type: 'mysql', url: process.env.MYSQL_URL! },
  },

  auth,

  audit: {
    enabled: true,
    logQuery: true,
    logParams: true,
    logDuration: true,
    logUser: true,
    logDenied: true,
    logAdminActions: true,
    retention: '90d',
  },

  permissions: {
    'view_own_orders': {
      name: 'View own orders',
      description: 'Read orders filtered by user organization membership',
      table: 'main.orders',
      operations: { select: true },
      columns: ['id', 'amount', 'status', 'customer_id', 'created_at'],
      filter: {
        organization: {
          members: { user_id: { $eq: '$user.id' } },
        },
      },
      limit: 1000,
    },

    'edit_org_orders': {
      name: 'Edit organization orders',
      description: 'Update orders within own org, owners and admins only',
      table: 'main.orders',
      operations: { select: true, update: true },
      columns: '*',
      filter: {
        organization: {
          members: {
            user_id: { $eq: '$user.id' },
            role: { $in: ['owner', 'admin'] },
          },
        },
      },
      check: {
        status: { $in: ['draft', 'active', 'closed'] },
        amount: { $gte: 0, $lte: 100000 },
      },
      preset: { updated_by: '$user.id' },
    },

    'create_orders': {
      name: 'Create orders',
      description: 'Insert new orders with tenant auto-assignment',
      table: 'main.orders',
      operations: { insert: true },
      columns: ['amount', 'status', 'customer_id'],
      check: {
        amount: { $gte: 0 },
        status: { $in: ['draft'] },
      },
      preset: {
        created_by: '$user.id',
        organization_id: '$user.current_org_id',
      },
    },

    'delete_draft_orders': {
      name: 'Delete draft orders',
      description: 'Delete only draft orders within own org',
      table: 'main.orders',
      operations: { delete: true },
      filter: {
        organization: {
          members: {
            user_id: { $eq: '$user.id' },
            role: { $eq: 'owner' },
          },
        },
        status: { $eq: 'draft' },
      },
    },
  },

  roles: {
    analyst:  ['view_own_orders'],
    editor:   ['view_own_orders', 'edit_org_orders', 'create_orders'],
    admin:    ['view_own_orders', 'edit_org_orders', 'create_orders', 'delete_draft_orders'],
  },
})
```

### Error Responses

Error verbosity depends on context (see **Security > Error Response Sanitization**).

**Admin UI / development mode** — full diagnostic response:

```json
{
  "error": "PERMISSION_DENIED",
  "message": "Role 'analyst' does not have 'select' permission on 'main.payments'",
  "correlation_id": "req_abc123",
  "role": "analyst",
  "table": "main.payments",
  "operation": "select",
  "requested": {
    "columns": ["id", "amount", "order_id"],
    "from_relation": "main.orders.payments"
  },
  "fix": {
    "analyst": {
      "main.payments": {
        "select": {
          "columns": ["id", "amount", "order_id"],
          "filter": {}
        }
      }
    }
  }
}
```

**Production data endpoint** — opaque response:

```json
{
  "error": "PERMISSION_DENIED",
  "message": "Access denied",
  "correlation_id": "req_abc123"
}
```

The full diagnostic (including `fix`) is always written to the server-side audit log regardless of mode, keyed by `correlation_id`.

- In `programmatic` mode: developer looks up `correlation_id` in audit log or runs in dev mode to see the fix JSON, then copies it into code.
- In `admin_ui` mode: admin opens the audit log entry, clicks **[+ Grant Access]** button, pre-fills the permission form.

---

## Security

### No Raw SQL From Client

The client SDK sends structured JSON query objects, never raw SQL. The server is the only SQL generator.

```
CLIENT sends:
{
  "action": "findMany",
  "table": "main.orders",
  "select": ["id", "amount"],
  "where": { "status": { "$eq": "active" } },
  "include": { "customer": ["name"] },
  "orderBy": { "created_at": "desc" },
  "limit": 50
}
```

### No God Mode

Every query goes through the permission pipeline. No root user, no superuser bypass. Admin users have their own role with explicitly defined permissions.

### DuckDB Session Isolation

Each user session gets its own **ephemeral DuckDB instance**. Instances are created on first query and destroyed when the session ends (or after an idle timeout). This provides:

- **Query isolation:** One user's query cannot interfere with another's. No shared state between sessions.
- **`customSql` sandboxing:** Custom SQL WHERE clauses execute inside the user's isolated DuckDB instance, which only has access to the databases ATTACHed for that session's project. Even if a `customSql` clause is malicious, it can only see what the permission system already ATTACHed — no access to the app database (Turso), other projects' databases, or the filesystem.
- **Resource limits per instance:** Each DuckDB instance is configured with:
  - `max_memory`: 256MB (configurable per project)
  - `threads`: 2 (configurable)
  - `timeout`: 30s query execution timeout
  - Extensions disabled (`INSTALL`/`LOAD` blocked)
- **Instance pooling:** A pool of pre-warmed DuckDB instances (with no ATTACHes) can be maintained to reduce cold-start latency. On session start, an instance is claimed from the pool and the project's connections are ATTACHed.

```
Session arrives (user_id + project_id)
  │
  ├─ 1. Claim DuckDB instance from pool (or create new)
  ├─ 2. ATTACH only this project's connections (read-only user where possible)
  ├─ 3. Execute queries through permission pipeline
  ├─ 4. On session end / idle timeout → DETACH all, return instance to pool
  └─ 5. On pool recycle → destroy instance entirely
```

### DuckDB Hardening

Dangerous DuckDB functions and statements are blocked at the query builder level (allowlist approach — only known-safe constructs pass):

- `read_csv`, `read_parquet`, `read_json` (filesystem access)
- `COPY ... TO` (data exfiltration)
- `INSTALL`, `LOAD` (extension loading)
- `ATTACH`, `DETACH` (connection manipulation — only the engine can ATTACH)
- `pragma` statements
- `information_schema` / `pg_catalog` queries (blocked for non-admin users — prevents schema enumeration of ATTACHed databases beyond permitted tables)
- `CREATE`, `DROP`, `ALTER` (DDL — the engine never generates DDL from user queries)

**ATTACH restrictions:** The engine is the only code path that calls `ATTACH`. User queries never contain `ATTACH` — the query builder rejects any SQL containing it. Each ATTACH uses the least-privileged database credentials available:
- Read-only DB user for connections that only need `select` operations
- Scoped write user (limited to specific tables) for connections that need insert/update/delete

### Admin UI Authentication

The admin UI (`/admin`) is protected by **better-auth**, with a separate auth instance per project. Each project has its own users, sessions, and credentials — completely isolated from end-user auth.

```
Admin auth flow:
  │
  ├─ 1. /admin → better-auth login (project-scoped)
  ├─ 2. Session stored in project's Turso DB (admin_sessions table)
  ├─ 3. Every admin API route checks: valid session + admin role for this project
  ├─ 4. Admin roles: "project_owner", "project_admin", "project_viewer"
  │     - project_owner: full access, can manage other admins
  │     - project_admin: manage permissions, roles, connections (no admin user mgmt)
  │     - project_viewer: read-only dashboard, audit log, schema explorer
  └─ 5. Session expires after configurable idle timeout (default: 1h)
```

**Hardening:**
- Admin login rate-limited: 5 attempts per IP per minute, exponential backoff after 3 failures
- Admin sessions are short-lived (1h idle timeout, 24h absolute timeout)
- All admin state-changing actions are logged to `audit_logs` with `action: 'admin_*'`
- Optional: IP allowlist per project for admin access
- CSP headers on all admin UI responses: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'`

### JWT Validation

All data-endpoint JWTs are validated with strict rules:

- **Algorithm allowlist:** Only `RS256`, `ES256`, or `EdDSA`. The `none` algorithm and symmetric algorithms (`HS256`) with weak secrets are rejected. Algorithm is checked against the server config, not the JWT header (prevents `alg` switching attacks).
- **Claims validation:** `exp` (required — reject expired), `nbf` (reject if before), `iss` (must match configured issuer), `aud` (must match configured audience).
- **Clock skew:** Max 30 seconds tolerance, configurable.
- **Token revocation:** Short-lived access tokens (15 min default) + refresh tokens. The engine does not maintain a token blacklist — short TTL is the revocation mechanism. If immediate revocation is needed, the auth provider's `resolveSession` can check an `is_active` flag in the database.

### Request Limits

Every data query is subject to hard limits (configurable per project):

| Limit | Default | Description |
|-------|---------|-------------|
| `maxLimit` | 10,000 | Max rows a single `findMany` can return |
| `maxIncludeDepth` | 3 | Max levels of relationship `include` nesting |
| `maxFilterDepth` | 5 | Max levels of nested `$and`/`$or`/relationship traversal in `where` |
| `maxFilterConditions` | 50 | Max total conditions in a single `where` clause |
| `maxRequestBodySize` | 1MB | Max HTTP request body size |
| `queryTimeout` | 30s | Max DuckDB query execution time |
| `rateLimitPerUser` | 200/min | Max queries per user per minute |
| `rateLimitPerIP` | 500/min | Max queries per IP per minute |

Exceeding any limit returns `400 Bad Request` with the limit name (no internal details).

### Error Response Sanitization

Error responses differ by context:

**Production (data endpoint):**
```json
{
  "error": "PERMISSION_DENIED",
  "message": "Access denied",
  "correlation_id": "req_abc123"
}
```

No table names, column names, role names, or fix suggestions. The `correlation_id` maps to the full details in the server-side audit log.

**Admin UI (authenticated admin only):**
```json
{
  "error": "PERMISSION_DENIED",
  "message": "Role 'analyst' does not have 'select' on 'main.payments'",
  "role": "analyst",
  "table": "main.payments",
  "operation": "select",
  "fix": { ... }
}
```

The verbose response (including the `fix` JSON and `[+ Grant Access]` button) is only returned to authenticated admin sessions in the admin UI context, never to the data endpoint.

**Development mode (`NODE_ENV=development`):**
Verbose errors including fix JSON are returned on the data endpoint for developer convenience. A startup warning is logged: `⚠ Verbose error responses enabled — do not use in production`.

### Schema Exposure

- `/schema` endpoint requires `schema_api_token` (hashed with argon2, displayed once on creation)
- Requires **explicit opt-in**: `schemaEndpoint: true` in engine config (default: `false`)
- When `NODE_ENV=production` and `schemaEndpoint` is not explicitly `true`, returns 404
- Rate-limited: 10 requests per minute per token
- Every access logged to `audit_logs` with `action: 'schema_introspect'`
- Token expiration enforced — expired tokens return 401 (the `expires_at` field is checked on every request)

### Connection Secrets

Connection URLs are sensitive credentials handled with a one-way display flow:

1. **On creation:** The connection URL is encrypted with AES-256-GCM using a per-project encryption key, then stored in Turso. The plaintext URL is displayed **once** to the admin, then never shown again.
2. **Per-project key:** Each project has its own encryption key derived from a master key via HKDF. The master key is loaded from environment (`SUPERAPP_MASTER_KEY`) or an external KMS (AWS KMS, GCP KMS — configurable).
3. **On read (admin UI):** The connection URL is shown as `postgres://***:***@host:5432/dbname` — host and database are visible, credentials are masked. A "Test connection" button decrypts server-side and tests without exposing the URL to the browser.
4. **On ATTACH:** Decrypted server-side, passed to DuckDB's ATTACH, then the plaintext is immediately zeroed from memory (no logging, no caching).
5. **Rotation:** Admins can update the connection URL (re-encrypts with the same project key). Master key rotation re-encrypts all connection URLs in a background migration.

### CSRF Protection

- **Data endpoint:** Uses `Authorization: Bearer <jwt>` header — inherently CSRF-safe (not sent automatically by browsers).
- **Admin UI:** Uses `SameSite=Strict` session cookies + `Origin` header validation. All state-changing admin requests must include a CSRF token in a custom header (`X-CSRF-Token`). The token is bound to the admin session.
- **Auth endpoints (login/signup):** `SameSite=Strict` cookies. The `Origin` header is validated against a configured allowlist of origins.

### Content Security Policy

All responses from the engine include security headers:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

The admin UI CSP is slightly more permissive for Monaco Editor (`script-src 'self' blob:; worker-src 'self' blob:`).

### Audit Defaults

```typescript
audit: {
  enabled: true,
  logQuery: true,
  logParams: true,       // on by default — opt-out if PII concerns
  logDuration: true,
  logUser: true,
  logDenied: true,
  logAdminActions: true,  // admin UI mutations (role changes, permission edits, etc.)
  retention: '90d',       // 90 days default, configurable up to 7 years for compliance
  piiRedaction: false,    // when true, hashes param values instead of storing plaintext
}
```

---

## Data Model (Turso / libSQL + Drizzle)

The app's own database stores projects, users, roles, permissions, connections, and audit logs.

```
projects
  ├── id              text PK (nanoid, 21 chars, cryptographically random)
  ├── name            text NOT NULL
  ├── slug            text UNIQUE NOT NULL
  ├── mode            text NOT NULL ('admin_ui' | 'programmatic')
  ├── settings        text (JSON)
  ├── encryption_key_id text NOT NULL (HKDF-derived key identifier for this project's secrets)
  ├── created_at      integer NOT NULL
  └── updated_at      integer NOT NULL

admin_users (managed by better-auth, per-project instance)
  ├── id              text PK
  ├── project_id      text FK → projects.id
  ├── email           text NOT NULL
  ├── name            text
  ├── password_hash   text NOT NULL (argon2id)
  ├── admin_role      text NOT NULL ('project_owner' | 'project_admin' | 'project_viewer')
  ├── is_active       integer DEFAULT 1
  ├── failed_logins   integer DEFAULT 0
  ├── locked_until    integer (unix timestamp, null = not locked)
  ├── created_at      integer NOT NULL
  └── updated_at      integer NOT NULL
  └── UNIQUE(project_id, email)

connections
  ├── id              text PK
  ├── project_id      text FK → projects.id
  ├── name            text NOT NULL
  ├── type            text NOT NULL ('postgres' | 'mysql' | 'sqlite' | ...)
  ├── connection_url  text NOT NULL (AES-256-GCM encrypted, per-project key)
  ├── connection_host text NOT NULL (plaintext host:port for display — no credentials)
  ├── is_active       integer NOT NULL DEFAULT 1
  ├── created_at      integer NOT NULL
  ├── created_by      text FK → admin_users.id
  └── updated_at      integer NOT NULL

roles
  ├── id              text PK
  ├── project_id      text FK → projects.id
  ├── name            text NOT NULL
  ├── description     text
  ├── is_system       integer DEFAULT 0 (system roles cannot be deleted or renamed)
  ├── created_by      text FK → admin_users.id
  ├── updated_by      text FK → admin_users.id
  ├── created_at      integer NOT NULL
  └── updated_at      integer NOT NULL
  └── UNIQUE(project_id, name)

permissions
  ├── id              text PK
  ├── project_id      text FK → projects.id
  ├── name            text NOT NULL
  ├── slug            text NOT NULL
  ├── description     text
  ├── table_name      text NOT NULL
  ├── operations      text NOT NULL (JSON: {"select":true,"insert":false,...})
  ├── columns         text NOT NULL (JSON: ["id","amount"] or ["*"])
  ├── filter          text (JSON: MongoDB-style conditions, validated against sessionSchema)
  ├── check           text (JSON: write validation)
  ├── preset          text (JSON: auto-set values, $user.* validated against sessionSchema)
  ├── row_limit       integer
  ├── custom_sql      text (raw SQL WHERE, max 2000 chars, AST-validated on save)
  ├── created_by      text FK → admin_users.id
  ├── updated_by      text FK → admin_users.id
  ├── created_at      integer NOT NULL
  └── updated_at      integer NOT NULL
  └── UNIQUE(project_id, slug)

role_permissions
  ├── role_id         text FK → roles.id
  ├── permission_id   text FK → permissions.id
  └── PRIMARY KEY(role_id, permission_id)

users
  ├── id              text PK
  ├── project_id      text FK → projects.id
  ├── email           text NOT NULL
  ├── name            text
  ├── auth_provider_id text
  ├── is_active       integer DEFAULT 1
  ├── created_at      integer NOT NULL
  └── updated_at      integer NOT NULL
  └── UNIQUE(project_id, email)

user_roles
  ├── user_id         text FK → users.id
  ├── role_id         text FK → roles.id
  ├── created_at      integer NOT NULL
  └── PRIMARY KEY(user_id, role_id)

audit_logs
  ├── id              text PK
  ├── correlation_id  text NOT NULL UNIQUE (returned to client for log lookup)
  ├── project_id      text FK → projects.id
  ├── user_id         text FK → users.id (nullable — null for admin actions before auth)
  ├── admin_user_id   text FK → admin_users.id (nullable — set for admin UI actions)
  ├── ip_address      text
  ├── user_agent      text (truncated to 256 chars)
  ├── action          text NOT NULL ('select' | 'insert' | 'update' | 'delete' | 'admin_*')
  ├── table_name      text (nullable — null for admin actions like role changes)
  ├── query           text (generated SQL, if audit.logQuery = true)
  ├── params          text (JSON, if audit.logParams = true; hashed if piiRedaction = true)
  ├── duration_ms     integer
  ├── status          text NOT NULL ('success' | 'denied' | 'error')
  ├── denied_reason   text (JSON: full diagnostic including "fix" object — never sent to client in production)
  ├── row_count       integer
  └── created_at      integer NOT NULL
  └── INDEX(project_id, created_at) — for retention cleanup and time-range queries

schema_tokens
  ├── id              text PK
  ├── project_id      text FK → projects.id
  ├── token_hash      text NOT NULL (argon2id — displayed once on creation, never retrievable)
  ├── token_prefix    text NOT NULL (first 8 chars, for identification in UI: "sk_a3f2...")
  ├── name            text NOT NULL
  ├── last_used_at    integer
  ├── expires_at      integer NOT NULL (required — max 1 year, default 90 days)
  ├── created_by      text FK → admin_users.id
  ├── created_at      integer NOT NULL
  └── updated_at      integer NOT NULL
```

**Relationships:**

```
projects ──1:N── admin_users (admin UI access, per-project better-auth)
projects ──1:N── connections
projects ──1:N── roles ──M:N── permissions (via role_permissions)
projects ──1:N── users ──M:N── roles (via user_roles)
projects ──1:N── permissions
projects ──1:N── audit_logs
projects ──1:N── schema_tokens
```

---

## Admin UI

Single-page React app served as static assets by any adapter. Accessible at `/admin`.

### Sidebar

```
Dashboard
Getting Started
Integrations
Explorer
Authentication
Roles
Permissions
Users
Audit Log
Settings
```

### Pages

**Dashboard** — Overview stats: active connections, total queries (24h), denied queries (24h), users, roles.

**Getting Started** — Integration guide displayed directly in the admin UI. Two sections:

1. **Quick Start** (always visible) — Single command: `npx @superapp/backend create-app my-app`. Scaffolds a complete Next.js project pre-wired with auth (`AuthProvider`, `AuthCard`, `UserButton`), a typed query client pointed at this engine, generated schema types (dev token auto-provisioned), and Tailwind + shadcn/ui. The user runs `cd my-app && pnpm dev` and has a working app immediately. The command reads the engine URL from the current admin session context and injects it into the scaffolded project's `.env.local`. The scaffolded project depends only on `@superapp/db` (the open-source client).

2. **Manual Integration** (collapsed by default, expandable) — For existing projects. Four numbered steps with copyable code blocks and framework tabs (Next.js, React Router, Vite): (1) Install `@superapp/db`, (2) Add authentication — `createAuth` from `@superapp/db/auth`, `AuthProvider`/`AuthCard`/`UserButton` from `@superapp/db/components`, (3) Generate types — create token in Settings, run `npx @superapp/backend generate --token <token>`, (4) Query data — `createClient` from `@superapp/db`, `findMany`, filters, includes.

The page detects project state (no connections → nudge to Integrations, no roles → nudge to Roles) and highlights the next recommended action. All code blocks have a copy button.

**Integrations** — Add/edit/test database connections. Shows provider capabilities (R/W). Modular: each provider renders its own config form from `configSchema`.

```
  main        PostgreSQL     R W          12 tables
  warehouse   MySQL          R W           4 tables
  reports     CSV Files      R .           3 files
```

**Explorer** — Browse schema, preview data, run queries. Schema tree on the left, data grid + column info on the right.

**Authentication** — Configure the auth provider. Provider renders its own form. Shows resolved `$user` shape for autocomplete. Session resolver TypeScript editor (Monaco) with Kysely autocomplete. Test with real token.

**Roles** — Create/edit/delete roles. Assign permissions to roles. Clone role. Natural language summary of what each role can do. Test as role with real user.

**Permissions** — Create/edit reusable permission objects. Three editor modes: Visual, JSON (Monaco), Custom SQL. Permissions can be attached to multiple roles.

**Users** — List users, assign/remove roles, activate/deactivate.

**Audit Log** — Query log with status (success/denied/error). Expandable denied entries show the exact fix JSON and a [+ Grant Access] button. Filterable by role, table, status, time range. Export CSV.

**Settings** — Project mode toggle, audit config, schema token management.

### Permission Editor — Three Modes

#### Mode 1: Visual Builder

Unified condition palette — one `+` entry point that shows columns, relationships, and logic groups:

```
+ | Search columns, relationships, or "group"...
  |
  | ── Columns ──────────────────────
  | id            int      PK
  | amount        decimal
  | status        varchar
  | customer_id   int      FK → customers
  |
  | ── Relationships ────────────────
  | → customer       (via customer_id)
  | → organization   (via organization_id)
  | ← payments       (payments.order_id → id)
  |
  | ── Logic ────────────────────────
  | AND group   (all conditions must match)
  | OR group    (any condition must match)
```

Each condition reads as a sentence. Click any word to edit inline:

```
status   equals   "active"
amount   is greater than   0
through  orders → organization → members
  user_id   equals   $user.id
  role      is one of   ["owner", "admin"]
```

Features:
- Type-aware operators (string/number/date show different options)
- Value suggestions from actual DB data (distinct values)
- `$user.*` autocomplete with key icon for dynamic values
- Relationship breadcrumb path builder (step by step FK traversal)
- Drag handles for reordering conditions
- AND/OR groups with switch toggle
- Live row count ("~47 rows match")
- Natural language summary auto-generated
- SQL preview always visible, updates live

Column selector is a multi-select dropdown with "All columns" toggle, search, and chip display.

#### Mode 2: JSON Editor (Monaco)

Monaco Editor with JSON schema generated from the database schema. Provides:
- Autocomplete for column names, relation names, operators, `$user.*` variables
- Validation with red underlines for invalid fields
- Hover tooltips showing column types
- Full type inference

#### Mode 3: Custom SQL

Monaco SQL editor for raw WHERE clauses. Named parameters (`:param_name`) mapped to `$user.*` variables or static values. Engine still enforces column restrictions and row limits.

### Permission Matrix View

Grid showing roles x tables x operations at a glance:

```
                analyst    editor     admin
              S I U D    S I U D    S I U D
main.orders   . . . .    . . . .    . . . .
main.customers. . . .    . . . .    . . . .
main.payments . . . .    . . . .    . . . .
```

Click any cell to configure. Three indicator states: full access, filtered (has WHERE), no access.

---

## Client SDK

Type-safe query builder that sends structured JSON over HTTP+JWT.

### Type Generation

```bash
npx @superapp/backend generate --token <schema_api_token>
```

Connects to the running engine, introspects all databases via DuckDB, generates:

```typescript
// generated/schema.ts
export interface SuperAppSchema {
  main: {
    orders: {
      id: number
      amount: number
      status: 'draft' | 'active' | 'closed'
      customer_id: number
      created_at: Date
      customer: main['customers']
    }
    customers: {
      id: number
      name: string
      email: string
      orders: main['orders'][]
    }
  }
  warehouse: {
    events: { /* ... */ }
  }
}
```

### Client Usage

```typescript
import { createClient } from '@superapp/db'
import type { SuperAppSchema } from './generated/schema'

// Remote client (over HTTP)
const db = createClient<SuperAppSchema>({
  url: 'https://api.myapp.com/data',
  userToken: jwt,
})

// Direct client (in-process, same permission pipeline, no HTTP)
const db = engine.createClient({ userToken: jwt })

// Full autocomplete: tables, columns, relations, types
const orders = await db.main.orders.findMany({
  where: { status: 'active' },
  select: ['id', 'amount'],
  include: { customer: ['name'] },
  orderBy: { created_at: 'desc' },
  limit: 50,
})
```

### Client Auth UI

Thin wrapper around `@daveyplate/better-auth-ui`. The client SDK re-exports pre-built shadcn/ui components for login, signup, and user management. All auth requests route to the engine's `/auth` endpoint.

**Design principle:** Zero custom UI code. Every component is a direct re-export from `better-auth-ui`. The only custom code is `createAuth()` (factory pointing to `/auth`) and `AuthProvider` (thin wrapper passing router callbacks).

**`createAuth(baseURL)`** — Factory that creates a better-auth client instance:

```typescript
import { createAuth } from '@superapp/db/auth'

const authClient = createAuth('https://api.myapp.com')
// → internally calls createAuthClient({ baseURL: 'https://api.myapp.com/auth' })
```

**`<AuthProvider>`** — Context wrapper that supplies the auth client and router integration to all child components:

```typescript
import { AuthProvider } from '@superapp/db/components'
import { createAuth } from '@superapp/db/auth'

const authClient = createAuth('https://api.myapp.com')

// Next.js example
function App({ children }) {
  const router = useRouter()
  return (
    <AuthProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      Link={Link}
      onSessionChange={() => router.refresh()}
    >
      {children}
    </AuthProvider>
  )
}

// React Router example
function App({ children }) {
  const navigate = useNavigate()
  return (
    <AuthProvider
      authClient={authClient}
      navigate={navigate}
      Link={NavLink}
    >
      {children}
    </AuthProvider>
  )
}
```

**`<AuthCard>`** — Drop-in sign-in / sign-up / forgot-password card (re-export from `@daveyplate/better-auth-ui`):

```typescript
import { AuthCard } from '@superapp/db/components'

// Renders the appropriate form based on the current route
// /auth/sign-in → sign in form
// /auth/sign-up → sign up form
// /auth/forgot-password → password reset form
function AuthPage() {
  return <AuthCard />
}
```

**`<UserButton>`** — Dropdown menu showing user avatar, name, session management (re-export from `@daveyplate/better-auth-ui`):

```typescript
import { UserButton } from '@superapp/db/components'

function Navbar() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <UserButton />
    </nav>
  )
}
```

**What ships:** 4 files, ~30 lines of custom code total. Everything else delegates to `better-auth-ui`.

| File | Purpose | Custom code |
|------|---------|-------------|
| `auth.ts` | `createAuth(baseURL)` factory | ~10 lines |
| `auth-provider.tsx` | Wraps `AuthUIProvider` | ~15 lines |
| `auth-card.tsx` | Re-export | 1 line |
| `user-button.tsx` | Re-export | 1 line |

### Auto-Generated Documentation

`npx @superapp/backend generate` produces three outputs:

**1. `generated/schema.ts`** — TypeScript types (as shown above)

**2. `generated/sdk-docs.md`** — Markdown documentation for AI agents and developers

```markdown
# MyApp Database SDK

> Auto-generated by @superapp/db on 2026-02-10.
> Engine: https://api.myapp.com/data

## Available Tables

### main.orders

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | number | no | Primary key |
| amount | number | no | Order amount in cents |
| status | 'draft' \| 'active' \| 'closed' | no | Current order status |
| customer_id | number | no | FK → main.customers.id |
| organization_id | number | no | FK → main.organizations.id |
| created_at | Date | no | Creation timestamp |

**Relationships:**
- `customer` → main.customers (via customer_id)
- `organization` → main.organizations (via organization_id)
- `payments` ← main.payments (via payments.order_id)

**Example queries:**

```typescript
// Fetch all orders
const orders = await db.main.orders.findMany({
  select: ['id', 'amount', 'status', 'created_at'],
  where: { status: 'active' },
  orderBy: { created_at: 'desc' },
  limit: 50,
})

// Fetch orders with customer name included
const ordersWithCustomer = await db.main.orders.findMany({
  select: ['id', 'amount', 'status'],
  include: { customer: ['name', 'email'] },
  where: { amount: { $gte: 1000 } },
})

// Insert a new order
const newOrder = await db.main.orders.create({
  data: { amount: 5000, status: 'draft', customer_id: 42 },
})

// Update an order
await db.main.orders.update({
  where: { id: 1 },
  data: { status: 'active' },
})

// Delete an order
await db.main.orders.delete({
  where: { id: 1 },
})

// Count orders
const count = await db.main.orders.count({
  where: { status: 'active' },
})
```

### main.customers

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | number | no | Primary key |
| name | string | no | Customer full name |
| email | string | no | Customer email |

**Relationships:**
- `orders` ← main.orders[] (via orders.customer_id)

**Example queries:**
...

---

## Query API Reference

### findMany(options)
Fetch multiple rows.
- `select`: string[] — columns to return (default: all permitted)
- `where`: object — filter conditions using MongoDB operators ($eq, $gt, $in, etc.)
- `include`: object — related tables to join { relation: ['col1', 'col2'] }
- `orderBy`: object — sort by column { column: 'asc' | 'desc' }
- `limit`: number — max rows to return
- `offset`: number — rows to skip (pagination)

### findOne(options)
Fetch a single row. Same options as findMany but returns one row or null.

### create(options)
Insert a new row.
- `data`: object — column values to insert

### update(options)
Update existing rows.
- `where`: object — which rows to update (required)
- `data`: object — column values to set

### delete(options)
Delete rows.
- `where`: object — which rows to delete (required)

### count(options)
Count matching rows.
- `where`: object — filter conditions

### aggregate(options)
Run aggregations.
- `where`: object — filter conditions
- `sum`: string | string[] — columns to sum
- `avg`: string | string[] — columns to average
- `min`: string | string[] — columns to get min
- `max`: string | string[] — columns to get max
- `groupBy`: string[] — group results by columns

## Filter Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `$eq` | Equals | `{ status: { $eq: 'active' } }` |
| `$ne` | Not equals | `{ status: { $ne: 'deleted' } }` |
| `$gt` | Greater than | `{ amount: { $gt: 100 } }` |
| `$gte` | Greater than or equal | `{ amount: { $gte: 100 } }` |
| `$lt` | Less than | `{ amount: { $lt: 1000 } }` |
| `$lte` | Less than or equal | `{ amount: { $lte: 1000 } }` |
| `$in` | In array | `{ status: { $in: ['active', 'draft'] } }` |
| `$nin` | Not in array | `{ status: { $nin: ['deleted'] } }` |
| `$like` | Pattern match | `{ name: { $like: '%john%' } }` |
| `$ilike` | Case-insensitive pattern | `{ name: { $ilike: '%john%' } }` |
| `$is_null` | Is null | `{ deleted_at: { $is_null: true } }` |
| `$and` | Logical AND | `{ $and: [cond1, cond2] }` |
| `$or` | Logical OR | `{ $or: [cond1, cond2] }` |
| `$not` | Logical NOT | `{ $not: { status: { $eq: 'deleted' } } }` |

## Notes

- All queries are subject to row-level security. The server automatically
  injects WHERE clauses based on your user's role and permissions.
- Some columns may not be visible depending on your role.
- Write operations (create, update, delete) may have additional validations
  and preset values injected by the permission system.
- Include only works for tables your role has select permission on.
```

**3. `generated/sdk-docs.json`** — Structured JSON for programmatic consumption by AI agents

```json
{
  "version": "1.0.0",
  "generated_at": "2026-02-10T14:30:00Z",
  "base_url": "https://api.myapp.com/data",
  "tables": {
    "main.orders": {
      "columns": {
        "id": { "type": "number", "nullable": false, "primary_key": true },
        "amount": { "type": "number", "nullable": false },
        "status": { "type": "string", "enum": ["draft", "active", "closed"] },
        "customer_id": { "type": "number", "fk": "main.customers.id" },
        "created_at": { "type": "Date", "nullable": false }
      },
      "relationships": {
        "customer": { "table": "main.customers", "type": "many_to_one", "via": "customer_id" },
        "payments": { "table": "main.payments", "type": "one_to_many", "via": "payments.order_id" }
      },
      "operations": ["findMany", "findOne", "create", "update", "delete", "count", "aggregate"]
    }
  },
  "operators": ["$eq", "$ne", "$gt", "$gte", "$lt", "$lte", "$in", "$nin", "$like", "$ilike", "$is_null", "$and", "$or", "$not"]
}
```

The CLI generates all three files in a single run:

```bash
npx @superapp/backend generate --token <schema_api_token>

# Output:
#   generated/schema.ts      ← TypeScript types for autocomplete
#   generated/sdk-docs.md    ← Human + AI readable documentation
#   generated/sdk-docs.json  ← Machine-readable schema for AI agents
```

All three files are committed to git. AI coding agents (Cursor, Claude, Copilot) can read `sdk-docs.md` for full context on available tables, columns, relationships, and query examples. The JSON variant allows programmatic tooling to parse the schema.

### Schema API Token

- Generated in admin UI by project_owner or project_admin, scoped per project
- Token displayed **once** on creation (copy-to-clipboard), then stored as argon2id hash — never retrievable
- Token has a visible prefix (`sk_a3f2...`) for identification without exposing the full value
- `/schema` endpoint requires explicit `schemaEndpoint: true` in config — default is `false`
- When `NODE_ENV=production` and not explicitly enabled, returns 404
- Token has required expiration (max 1 year, default 90 days)
- Rate-limited: 10 requests/minute per token
- Generated types file committed to git, production uses static types

---

## Engine Modes

### `admin_ui` Mode

- Permissions managed via admin dashboard (read-write)
- Permissions stored in Turso database
- Admin can whitelist denied queries with one click
- Full audit log with [+ Grant Access] buttons

### `programmatic` Mode

- Permissions defined in code (source of truth is the repo)
- `permissions` config is required
- Admin UI is read-only (observe, debug, test — but no editing)
- Denied queries return `correlation_id` (production) or full fix JSON (development mode)
- Developer looks up `correlation_id` in audit log or runs in dev mode to get the fix, then copies into code

### Both Modes

- Same permission engine, same security guarantees
- Audit logging works in both
- Schema tokens work in both
- Same client SDK

---

## Engine Configuration (Full Example)

```typescript
import { createEngine } from '@superapp/backend'
import { betterAuthProvider } from '@superapp/backend/auth/better-auth'
import { postgresProvider } from '@superapp/backend/integrations/postgres'
import { mysqlProvider } from '@superapp/backend/integrations/mysql'
import { csvProvider } from '@superapp/backend/integrations/csv'
import { createHonoMiddleware } from '@superapp/backend/adapters/hono'
import { Hono } from 'hono'
import type { SuperAppSchema } from './generated/schema'

const engine = createEngine<SuperAppSchema>({
  database: process.env.TURSO_URL ?? './superapp.db',
  mode: 'admin_ui',

  integrations: [postgresProvider, mysqlProvider, csvProvider],

  connections: {
    main:      { type: 'postgres', url: process.env.PG_URL! },
    warehouse: { type: 'mysql', url: process.env.MYSQL_URL! },
    reports:   { type: 'csv', path: './data/reports/*.csv' },
  },

  auth: betterAuthProvider({
    secret: process.env.AUTH_SECRET!,
    userTable: {
      table: 'main.users',
      matchOn: { column: 'id', jwtField: 'id' },
      activeCheck: { column: 'is_active', value: true },
      columns: ['id', 'email', 'name'],
    },
    resolveSession: async (user, db) => {
      const memberships = await db
        .selectFrom('main.members')
        .select(['organization_id', 'role'])
        .where('user_id', '=', user.id)
        .where('status', '=', 'active')
        .execute()
      return {
        ...user,
        org_ids: memberships.map(m => m.organization_id),
        org_roles: memberships,
      }
    },
  }),

  limits: {
    maxLimit: 10_000,
    maxIncludeDepth: 3,
    maxFilterDepth: 5,
    maxFilterConditions: 50,
    maxRequestBodySize: '1mb',
    queryTimeout: 30_000,
    rateLimitPerUser: 200,   // per minute
    rateLimitPerIP: 500,     // per minute
  },

  duckdb: {
    poolSize: 10,            // pre-warmed instances
    maxMemory: '256MB',      // per instance
    threads: 2,              // per instance
    recycleAfter: 1000,      // destroy instance after N queries
  },

  security: {
    schemaEndpoint: false,   // explicit opt-in required
    adminIpAllowlist: [],    // empty = allow all
    verboseErrors: process.env.NODE_ENV === 'development',
  },

  audit: {
    enabled: true,
    logQuery: true,
    logParams: true,
    logDuration: true,
    logUser: true,
    logDenied: true,
    logAdminActions: true,
    retention: '90d',
    piiRedaction: false,
  },
})

// Hono app
const app = new Hono()
app.route('/api/data', createHonoMiddleware(engine))
app.route('/admin', engine.adminHandler())

export default app
```

---

## Testing

Vitest for both packages. Every module has co-located test files (`*.test.ts`). Tests run in CI on every push and PR.

**Workspace test commands:**

```bash
pnpm test              # run all tests (both packages)
pnpm test:db           # @superapp/db tests only
pnpm test:backend      # @superapp/backend tests only
pnpm test:coverage     # coverage report (both packages)
pnpm test:e2e          # end-to-end integration tests
```

### Test Infrastructure

| Tool | Purpose |
|------|---------|
| Vitest | Unit + integration test runner |
| @libsql/client | In-memory Turso for app database tests |
| DuckDB (in-process) | Real DuckDB instance for query/permission tests |
| msw (Mock Service Worker) | HTTP mocking for client SDK tests |
| @testing-library/react | Admin UI component tests |
| Playwright | E2E tests (admin UI flows, auth flows) |
| testcontainers | Postgres/MySQL containers for integration provider tests |

### `@superapp/db` (client) Tests

**`src/index.test.ts` — createClient**

```
✓ createClient returns a proxy with table accessors for each schema table
✓ db.main.orders.findMany sends correct JSON payload to POST /data
✓ db.main.orders.findOne sends { action: "findOne", limit: 1 }
✓ db.main.orders.create sends { action: "create", data: {...} }
✓ db.main.orders.update sends { action: "update", where: {...}, data: {...} }
✓ db.main.orders.delete sends { action: "delete", where: {...} }
✓ db.main.orders.count sends { action: "count" }
✓ db.main.orders.aggregate sends { action: "aggregate", sum: [...] }
✓ includes Authorization header with userToken
✓ throws on HTTP 401 (token expired/invalid)
✓ throws on HTTP 403 (permission denied) with correlation_id
✓ throws on HTTP 500 with error message
✓ throws on network failure with descriptive error
✓ does not send raw SQL — payload is always structured JSON
✓ respects limit, offset, orderBy in the payload
✓ include sends nested relation names correctly
✓ where operators ($eq, $gt, $in, $or, etc.) serialize correctly
```

**`src/auth.test.ts` — createAuth**

```
✓ createAuth appends /auth to baseURL
✓ createAuth('https://api.myapp.com') → baseURL 'https://api.myapp.com/auth'
✓ createAuth handles trailing slash in baseURL
✓ returns a better-auth client instance with signIn, signUp, signOut
```

**`src/components/auth-provider.test.tsx` — AuthProvider**

```
✓ renders children inside AuthUIProvider
✓ passes authClient, navigate, replace, Link, onSessionChange to AuthUIProvider
✓ works without optional props (replace, Link, onSessionChange)
```

**`src/types/index.test.ts` — Query protocol types**

```
✓ QueryRequest type accepts valid findMany payloads
✓ QueryRequest type accepts valid create payloads
✓ QueryRequest rejects payloads with unknown actions
✓ FilterOperators accept all documented operators ($eq through $not)
✓ FilterOperators reject unknown operator keys
```

### `@superapp/backend` Tests

#### Permission Engine (`src/backend/permissions.test.ts`)

The most critical test file. Tests the CASL-based permission engine in isolation.

**Column access:**

```
✓ select: returns only permitted columns
✓ select: rejects query requesting a non-permitted column
✓ select: columns: '*' grants all columns
✓ insert: rejects write to non-permitted column
✓ update: rejects modification of non-permitted column
```

**Row-level filters (WHERE injection):**

```
✓ select: injects WHERE clause from filter config
✓ select: $eq generates = operator
✓ select: $ne generates != operator
✓ select: $gt, $gte, $lt, $lte generate correct comparison operators
✓ select: $in generates IN (...)
✓ select: $nin generates NOT IN (...)
✓ select: $exists generates IS NOT NULL / IS NULL
✓ select: $regex generates LIKE or SIMILAR TO
✓ select: $and generates AND group
✓ select: $or generates OR group
✓ select: $not generates NOT (...)
✓ select: nested $and/$or groups generate correct parenthesization
✓ update: same filter applied as WHERE on existing rows
✓ delete: same filter applied as WHERE
✓ filter with $user.id substitutes actual user ID (parameterized)
✓ filter with $user.org_ids substitutes actual array (parameterized)
✓ $user.* values are always parameterized — never interpolated into SQL
```

**Relationship traversal:**

```
✓ single-hop FK filter generates EXISTS subquery
✓ multi-hop FK filter (orders → org → members) generates nested EXISTS
✓ filter through reverse FK (one-to-many) generates correct EXISTS
✓ invalid relationship name throws PermissionConfigError
✓ circular relationship path is detected and rejected
```

**Write validation (check):**

```
✓ insert: check rejects row that violates constraint
✓ insert: check allows row that satisfies all constraints
✓ update: check validates the resulting row, not just the diff
✓ check with $in validates against allowed values
✓ check with $gte/$lte validates numeric ranges
```

**Preset values:**

```
✓ insert: preset auto-sets column values before write
✓ update: preset auto-sets column values before write
✓ preset with $user.id injects actual user ID
✓ preset values cannot be overridden by client-supplied data
✓ preset value for non-existent column throws PermissionConfigError
```

**FK validation on writes:**

```
✓ insert with customer_id validates user can SELECT target row
✓ insert with customer_id rejects if target row outside user's permitted rows
✓ update changing FK value validates new target row
✓ FK validation skipped for preset columns (engine sets them)
```

**Row limit:**

```
✓ select: limit config caps returned rows
✓ select: client-requested limit is clamped to permission limit
✓ select: no limit in permission → global maxLimit still enforced
```

**Operation access:**

```
✓ rejects select on table with no select permission
✓ rejects insert on table with only select permission
✓ rejects update on table with only select + insert permission
✓ rejects delete on table with no delete permission
✓ role with no permissions on a table gets PERMISSION_DENIED
```

**Multi-role merging:**

```
✓ user with two roles gets union of both permission sets
✓ column sets merge (union) across roles
✓ filters merge with OR (most permissive row access wins)
✓ limits use the highest value across roles
```

**Error responses:**

```
✓ PERMISSION_DENIED includes role, table, operation, requested columns
✓ PERMISSION_DENIED includes fix object with exact grant JSON
✓ fix object is valid permission config (can be applied directly)
```

**Custom SQL permissions:**

```
✓ customSql.where is appended as raw WHERE clause
✓ customSql.params are parameterized (never interpolated)
✓ customSql params with $user.* are resolved to actual values
✓ customSql with SQL injection attempt is safely parameterized
```

#### Query Builder (`src/backend/queryBuilder.test.ts`)

```
✓ findMany generates SELECT with correct columns, WHERE, ORDER BY, LIMIT, OFFSET
✓ findOne generates SELECT ... LIMIT 1
✓ create generates INSERT INTO ... VALUES with parameterized values
✓ update generates UPDATE ... SET ... WHERE with parameterized values
✓ delete generates DELETE FROM ... WHERE with parameterized values
✓ count generates SELECT COUNT(*) with WHERE
✓ aggregate generates SELECT SUM/AVG/MIN/MAX with GROUP BY
✓ include generates LEFT JOIN for belongs-to relations
✓ include generates subquery for has-many relations
✓ rejects table name not in schema
✓ rejects column name not in schema
✓ rejects relation name not in schema
✓ WHERE injection via column name is impossible (column validated against schema)
✓ WHERE injection via value is impossible (all values parameterized)
✓ ORDER BY injection is impossible (column validated, direction enum)
```

#### DuckDB Hardening (`src/backend/queryBuilder.security.test.ts`)

```
✓ blocks read_csv() in any position
✓ blocks read_parquet() in any position
✓ blocks read_json() in any position
✓ blocks COPY ... TO
✓ blocks INSTALL extension
✓ blocks LOAD extension
✓ blocks ATTACH database
✓ blocks DETACH database
✓ blocks pragma statements
✓ blocks information_schema queries for non-admin users
✓ blocks pg_catalog queries for non-admin users
✓ blocks CREATE/DROP/ALTER DDL statements
✓ blocks semicolons in values (multi-statement injection)
✓ blocks UNION SELECT injection via operator values
✓ blocks subquery injection in WHERE values
✓ all blocked patterns tested in column names, table names, and filter values
✓ $regex values exceeding 200 chars are rejected
✓ $regex values with catastrophic backtracking patterns are rejected (safe-regex)
```

#### DuckDB Session Isolation (`src/backend/session.test.ts`)

```
✓ each session gets a separate DuckDB instance
✓ session instance only has ATTACHed databases for its project
✓ session cannot access Turso app database
✓ session cannot access other projects' databases
✓ session respects max_memory limit (rejects query exceeding memory)
✓ session respects query timeout (kills query after 30s)
✓ session cleanup: DETACH all on session end
✓ pool recycle: instance destroyed after configurable recycle count
✓ concurrent sessions do not share state
```

#### Admin Authentication (`src/auth/admin-auth.test.ts`)

```
✓ /admin routes require valid admin session
✓ /admin routes without session return 401
✓ admin login with valid credentials returns session cookie
✓ admin login with invalid credentials returns 401
✓ admin login rate-limited: 6th attempt within 1 minute returns 429
✓ account locked after 3 consecutive failures
✓ locked account returns 423 until lockout expires
✓ admin session expires after idle timeout
✓ admin session expires after absolute timeout (24h)
✓ project_viewer cannot modify permissions
✓ project_admin cannot manage other admin users
✓ project_owner can manage admin users
✓ admin actions logged to audit_logs with admin_user_id
✓ CSRF token required for state-changing admin requests
✓ request without X-CSRF-Token header returns 403
```

#### Request Limits (`src/backend/limits.test.ts`)

```
✓ findMany with limit > maxLimit is clamped to maxLimit
✓ include depth exceeding maxIncludeDepth returns 400
✓ filter depth exceeding maxFilterDepth returns 400
✓ filter with > maxFilterConditions conditions returns 400
✓ request body > maxRequestBodySize returns 413
✓ query exceeding queryTimeout is killed and returns 504
✓ user exceeding rateLimitPerUser returns 429
✓ IP exceeding rateLimitPerIP returns 429
✓ rate limit headers included in response (X-RateLimit-Remaining, X-RateLimit-Reset)
```

#### $user.* Variable Safety (`src/backend/permissions.user-vars.test.ts`)

```
✓ $user.* path validated against sessionSchema on permission save
✓ unknown $user.foo path rejected on save if not in sessionSchema
✓ $user.* resolves scalar string correctly at runtime
✓ $user.* resolves scalar number correctly at runtime
✓ $user.* resolves array of strings correctly at runtime
✓ $user.* resolves array of numbers correctly at runtime
✓ $user.* rejects object value at runtime (returns 500)
✓ $user.* rejects null value at runtime (returns 500)
✓ $user.* rejects undefined path at runtime (returns 500)
✓ $user.* values are always parameterized (never string-interpolated into SQL)
```

#### Custom SQL Validation (`src/backend/permissions.custom-sql.test.ts`)

```
✓ valid custom SQL with named params passes validation
✓ custom SQL with UNION is rejected on save
✓ custom SQL with INSERT/UPDATE/DELETE is rejected on save
✓ custom SQL with DROP/CREATE/ALTER is rejected on save
✓ custom SQL with ATTACH/COPY/LOAD is rejected on save
✓ custom SQL with disallowed function calls is rejected on save
✓ custom SQL with allowed functions (COUNT, SUM, etc.) passes validation
✓ custom SQL exceeding 2000 chars is rejected on save
✓ positional params ($1) are rejected on save
✓ :param_name without mapping in params object is rejected on save
✓ custom SQL modification logged with action 'admin_permission_custom_sql'
```

#### Connection Secrets (`src/backend/connections.test.ts`)

```
✓ connection URL encrypted with AES-256-GCM before storage
✓ stored connection URL is not plaintext
✓ decrypted URL matches original
✓ different projects use different derived encryption keys
✓ connection_host stored as plaintext for display (no credentials)
✓ API response never includes decrypted connection URL
✓ API response shows masked URL: postgres://***:***@host:5432/db
✓ test connection decrypts server-side and tests without exposing to client
```

#### Auth (`src/auth/better-auth.test.ts`)

```
✓ resolveSession returns user object from valid JWT
✓ resolveSession throws UnauthorizedError for expired JWT
✓ resolveSession throws UnauthorizedError for invalid signature
✓ resolveSession throws UnauthorizedError for malformed token
✓ resolveSession checks activeCheck column (rejects inactive users)
✓ resolveSession loads only specified columns from userTable
✓ resolveSession calls custom resolver and merges result
✓ engine auto-injects roles[] after resolveSession returns
✓ engine auto-injects permissions[] after resolveSession returns
✓ missing user in database throws UnauthorizedError
```

#### Audit Logger (`src/backend/audit.test.ts`)

```
✓ logs successful query with user, table, action, duration, row_count
✓ logs denied query with denied_reason and fix object
✓ logs error query with error message
✓ respects logQuery: false (omits SQL from log)
✓ respects logParams: false (omits params from log)
✓ respects logDuration, logUser flags
✓ writes to audit_logs table in Turso
✓ retention policy deletes logs older than configured period
```

#### Integration Providers

**`src/integrations/postgres.test.ts`** (testcontainers):

```
✓ testConnection succeeds with valid postgres URL
✓ testConnection fails with invalid URL and returns error message
✓ introspect returns tables, columns, types, foreign keys
✓ attach generates correct DuckDB ATTACH statement
✓ read query returns correct data through DuckDB
✓ write query (insert/update/delete) executes through DuckDB
```

**`src/integrations/mysql.test.ts`** (testcontainers):

```
✓ testConnection succeeds with valid mysql URL
✓ testConnection fails with invalid URL
✓ introspect returns tables, columns, types, foreign keys
✓ attach generates correct DuckDB ATTACH statement
✓ read/write queries execute correctly through DuckDB
```

**`src/integrations/sqlite.test.ts`**:

```
✓ testConnection succeeds with valid file path
✓ introspect returns tables, columns, types
✓ attach generates correct DuckDB ATTACH statement
✓ read/write queries execute correctly
```

**`src/integrations/csv.test.ts`**:

```
✓ introspect detects columns and types from CSV header
✓ read query returns correct data
✓ write operations are rejected (read-only capability)
```

#### Framework Adapters

**`src/adapters/hono.test.ts`**:

```
✓ POST /data executes query and returns JSON result
✓ POST /data with invalid JSON returns 400
✓ POST /data without Authorization header returns 401
✓ POST /data with expired token returns 401
✓ POST /data with denied query returns 403 with correlation_id (prod) or fix object (dev)
✓ GET /schema returns schema JSON when token is valid and schemaEndpoint enabled
✓ GET /schema returns 404 when schemaEndpoint not explicitly enabled
✓ GET /admin serves static admin UI assets
✓ CORS headers are set correctly
✓ request body size is limited (rejects oversized payloads)
```

**`src/adapters/next.test.ts`**:

```
✓ same test cases as hono adapter (shared adapter test suite)
✓ works with Next.js App Router route handler signature
```

**`src/adapters/express.test.ts`**:

```
✓ same test cases as hono adapter (shared adapter test suite)
✓ works with Express req/res/next signature
```

#### Schema Introspection (`src/backend/schema.test.ts`)

```
✓ introspects all tables from attached databases
✓ returns columns with correct types (mapped from DuckDB types to TS types)
✓ detects primary keys
✓ detects foreign keys with table and column references
✓ detects nullable columns
✓ detects enum/check constraint values where possible
✓ schema endpoint requires valid schema_api_token
✓ schema endpoint returns 404 when EXPOSE_SCHEMA=false
```

#### CLI (`src/cli/generate.test.ts`)

```
✓ generate connects to engine /schema endpoint
✓ generate writes schema.ts with correct TypeScript interfaces
✓ generate writes sdk-docs.md with table docs and examples
✓ generate writes sdk-docs.json with machine-readable schema
✓ generate fails with clear error on invalid token
✓ generate fails with clear error on unreachable engine
```

**`src/cli/create-app.test.ts`**:

```
✓ scaffolds project directory with all template files
✓ writes .env.local with engine URL and dev token
✓ template package.json depends on @superapp/db (not @superapp/backend)
✓ generated files are populated via generate command
✓ fails gracefully if target directory already exists
✓ fails gracefully if engine is unreachable
```

#### Data Model / Migrations (`src/db/schema.test.ts`)

```
✓ migrations run cleanly on empty Turso database
✓ all tables created with correct columns and types
✓ foreign key constraints are enforced
✓ unique constraints are enforced (project+slug, project+email, etc.)
✓ nanoid primary keys are generated correctly
✓ timestamps are set on insert and updated on modification
✓ connection_url is encrypted at rest (not stored as plaintext)
✓ schema_token is stored as argon2id hash (never retrievable)
```

#### Admin UI (`src/admin/`)

Component tests with @testing-library/react:

```
✓ permission editor visual builder renders conditions
✓ permission editor JSON mode validates against schema
✓ permission editor custom SQL mode accepts parameterized queries
✓ roles page creates/edits/deletes roles
✓ users page assigns/removes roles
✓ integrations page tests database connection
✓ audit log page filters by status, role, table, time range
✓ getting-started page renders create-app command with correct engine URL
✓ getting-started page detects missing connections and shows nudge
```

### End-to-End Tests (Playwright)

Full request lifecycle tests against a real engine instance with Turso (in-memory) + DuckDB + testcontainers Postgres.

**Auth flow:**

```
✓ sign up → creates user → redirects to dashboard
✓ sign in → valid credentials → sets JWT cookie
✓ sign in → invalid credentials → shows error
✓ sign out → clears session → redirects to sign-in
✓ forgot password → sends reset email (mocked)
✓ expired JWT → redirects to sign-in
```

**Query flow (permission enforcement):**

```
✓ analyst role: SELECT on permitted table returns filtered rows
✓ analyst role: SELECT on non-permitted table returns 403
✓ analyst role: INSERT on read-only table returns 403
✓ editor role: INSERT with valid data succeeds, preset values injected
✓ editor role: INSERT with invalid data (check violation) returns 400
✓ editor role: UPDATE on permitted rows succeeds
✓ editor role: UPDATE on non-permitted rows returns 403
✓ admin role: DELETE on draft orders succeeds
✓ admin role: DELETE on non-draft orders returns 403
✓ no role assigned: all queries return 403
✓ multi-role user: gets union of permissions
```

**Admin UI flow:**

```
✓ add Postgres connection → test → shows tables
✓ create role → assign permissions → verify in matrix view
✓ create permission with visual builder → verify SQL preview
✓ create permission with JSON editor → verify validation
✓ audit log shows denied queries with [Grant Access] button
✓ click [Grant Access] → pre-fills permission form
✓ schema token → generate → verify TypeScript output
```

**Security E2E:**

```
✓ SQL injection via where values — parameterized, no leak
✓ SQL injection via column names — rejected by schema validation
✓ SQL injection via table names — rejected by schema validation
✓ SQL injection via orderBy — rejected by enum validation
✓ raw SQL in query body — rejected (not a valid action)
✓ accessing /schema without token → 401
✓ accessing /schema with expired token → 401
✓ accessing /schema in production (not explicitly enabled) → 404
✓ oversized request body → 413
✓ malformed JSON body → 400
✓ JWT with alg:none → 401
✓ JWT with tampered payload → 401
✓ JWT signed with wrong secret → 401
✓ JWT with missing exp claim → 401
✓ JWT with expired exp → 401
✓ JWT with wrong iss/aud → 401
✓ CSRF: admin POST without X-CSRF-Token → 403
✓ CSRF: data endpoint with Bearer token (no CSRF needed) → 200
✓ connection URL never appears in API responses or logs
✓ production error response contains only correlation_id (no schema leak)
✓ development error response contains full fix JSON
✓ admin UI requires authentication → unauthenticated request redirects to login
✓ admin rate limiting: 6 rapid login attempts → 429
✓ include depth > 3 → 400
✓ filter depth > 5 → 400
✓ query timeout enforcement: slow query killed after 30s
✓ per-user rate limit: 201st request within 1 minute → 429
✓ security headers present on all responses (CSP, X-Frame-Options, etc.)
✓ session isolation: user A cannot see user B's query results
```

### Coverage Requirements

| Package | Min coverage | Critical paths (must be 100%) |
|---------|-------------|-------------------------------|
| `@superapp/db` | 90% lines | createClient, auth, types |
| `@superapp/backend` | 95% lines | permissions.ts, queryBuilder.ts, audit.ts |
| `@superapp/backend` security | 100% lines | queryBuilder.security.test.ts, DuckDB hardening, session isolation |
| `@superapp/backend` auth | 100% branches | resolveSession, token validation, admin auth, JWT validation |
| `@superapp/backend` limits | 100% branches | rate limiting, request limits, filter/include depth caps |
| `@superapp/backend` secrets | 100% lines | connection encryption/decryption, schema token hashing |

**CI pipeline:**

```yaml
# Runs on every push and PR
- pnpm install
- pnpm build
- pnpm test:coverage
- pnpm test:e2e           # Playwright + testcontainers
- fail if coverage < thresholds
```
