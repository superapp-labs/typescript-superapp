# @superapp/db — Design Document

## Overview

A thin, secure data access layer that sits between any database and any frontend. Connects to multiple databases via DuckDB, enforces role-based row-level security with automatic WHERE clause injection, and exposes a type-safe SDK for frontends to safely query data.

**Core principle:** As thin as possible, but modular, secure, and extensible.

```
Frontend (any framework)
  │
  └─ @superapp/db/client (type-safe query builder, no SQL)
       │
       │  HTTP + JWT (structured JSON query, never raw SQL)
       │
       └─ @superapp/db (Hono / Next.js / Express / any adapter)
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
            │    └─ Query, params, duration, userId, IP, denied reason
            │
            └─ DuckDB
                 ├─ ATTACH postgres (native)
                 ├─ ATTACH mysql (native)
                 ├─ ATTACH sqlite (native)
                 └─ Custom providers (HTTP, gRPC, etc.)
```

---

## Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| Query engine | DuckDB | Embedded, fast, ATTACH to postgres/mysql/sqlite, full CRUD support |
| Server framework | Hono (default adapter) | Lightweight, edge-compatible, TypeScript |
| App database | SQLite + Drizzle ORM | Projects, users, roles, permissions, audit logs |
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
| CLI | Built-in | `npx @superapp/db generate` for TypeScript type generation |

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
│              │   Description text in muted color                  │
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

### Responsive Behavior

```
Desktop (>1280px):  Full sidebar + content
Tablet (768-1280):  Collapsed sidebar (icons) + content
Mobile (<768):      Hidden sidebar (hamburger menu) + full-width content
```

---

## Package Structure

Single package: `@superapp/db` with subpath exports. Everything tree-shakes.

```
@superapp/db
├── src/
│   ├── engine/                    ← Core engine
│   │   ├── createEngine.ts             Main entry point
│   │   ├── queryBuilder.ts             Structured query → Kysely → SQL
│   │   ├── permissions.ts              CASL integration, WHERE injection
│   │   ├── audit.ts                    Query logging
│   │   └── schema.ts                   Schema introspection from DuckDB
│   │
│   ├── auth/                      ← Swappable auth providers
│   │   ├── types.ts                    AuthProvider interface
│   │   ├── better-auth.ts              Default: better-auth adapter
│   │   └── custom.ts                   Helper for DIY providers
│   │
│   ├── integrations/              ← Database integration providers
│   │   ├── types.ts                    IntegrationProvider interface
│   │   ├── postgres.ts                 Native DuckDB ATTACH
│   │   ├── mysql.ts                    Native DuckDB ATTACH
│   │   ├── sqlite.ts                   Native DuckDB ATTACH
│   │   ├── csv.ts                      Read-only, native DuckDB
│   │   ├── parquet.ts                  Read-only, native DuckDB
│   │   └── custom.ts                   Helper for custom HTTP providers
│   │
│   ├── adapters/                  ← Framework adapters (~30-50 lines each)
│   │   ├── hono.ts                     createHonoMiddleware(engine)
│   │   ├── next.ts                     createNextHandler(engine)
│   │   ├── express.ts                  createExpressRouter(engine)
│   │   └── generic.ts                  createHandler(engine) for any Request/Response
│   │
│   ├── admin/                     ← Admin UI (React, served as static assets)
│   │   ├── pages/
│   │   │   ├── dashboard.tsx
│   │   │   ├── integrations.tsx
│   │   │   ├── explorer.tsx
│   │   │   ├── authentication.tsx
│   │   │   ├── roles.tsx
│   │   │   ├── permissions.tsx
│   │   │   ├── users.tsx
│   │   │   ├── audit.tsx
│   │   │   └── settings.tsx
│   │   └── components/
│   │       ├── permission-editor/
│   │       │   ├── visual-builder.tsx
│   │       │   ├── json-editor.tsx
│   │       │   ├── custom-sql-editor.tsx
│   │       │   ├── condition-palette.tsx
│   │       │   ├── column-selector.tsx
│   │       │   └── sql-preview.tsx
│   │       └── ...
│   │
│   ├── client/                    ← Client SDK
│   │   ├── createClient.ts             Type-safe query builder
│   │   └── schemaLoader.ts             Dev-mode schema fetching
│   │
│   ├── db/                        ← App's own SQLite database
│   │   ├── schema.ts                   Drizzle schema
│   │   └── migrations/
│   │
│   └── cli/                       ← CLI tools
│       └── generate.ts                 TypeScript type generation
│
├── package.json
└── tsconfig.json
```

**Imports:**

```typescript
import { createEngine }            from '@superapp/db'
import { createClient }            from '@superapp/db/client'
import { betterAuthProvider }      from '@superapp/db/auth/better-auth'
import { postgresProvider }        from '@superapp/db/integrations/postgres'
import { mysqlProvider }           from '@superapp/db/integrations/mysql'
import { sqliteProvider }          from '@superapp/db/integrations/sqlite'
import { csvProvider }             from '@superapp/db/integrations/csv'
import { createHonoMiddleware }    from '@superapp/db/adapters/hono'
import { createNextHandler }       from '@superapp/db/adapters/next'
import { createExpressRouter }     from '@superapp/db/adapters/express'
```

**CLI:**

```bash
npx @superapp/db generate --token <schema_api_token>
```

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

  /** Validate and test the connection */
  testConnection(config: TConfig): Promise<{ ok: boolean; error?: string }>
  /** Discover tables, columns, types, foreign keys */
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
import { betterAuthProvider } from '@superapp/db/auth/better-auth'

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
           permissions: ["view-own-orders"] ← auto-injected by engine
         }
```

---

## Permission Model

Permissions are reusable objects with name, slug, and description. They can be shared across roles. Follows Hasura/PostgreSQL RLS semantics with MongoDB-style operators (CASL).

### Operators (MongoDB-style, CASL-native)

```
{ $eq: value }         { $ne: value }
{ $gt: value }         { $gte: value }
{ $lt: value }         { $lte: value }
{ $in: [values] }      { $nin: [values] }
{ $exists: boolean }
{ $regex: pattern }
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

Filters can traverse FK relationships to any depth to reach the user identity:

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

### Relationship Handling — Zero Config

If a user has `select` permission on both `main.orders` and `main.customers`, relationships work automatically. Each table's own filter applies independently.

If a user does NOT have access to a related table, including it is rejected.

### FK Validation on Writes

When writing a FK column (e.g., `customer_id`), the engine checks if the user can SELECT from the target table where `id` equals the value being written. If the target row isn't in the user's permitted rows, the write is rejected.

### Custom SQL Permissions

Power users can write raw SQL WHERE clauses with parameterized values:

```typescript
'advanced-reporting': {
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

### Programmatic Mode Example

```typescript
import { createEngine } from '@superapp/db'
import type { SuperAppSchema } from './generated/schema'

const engine = createEngine<SuperAppSchema>({
  mode: 'programmatic',
  database: './superapp.db',

  integrations: [postgresProvider, mysqlProvider],
  connections: {
    main: { type: 'postgres', url: process.env.PG_URL! },
    warehouse: { type: 'mysql', url: process.env.MYSQL_URL! },
  },

  auth,

  audit: {
    enabled: true,
    logQuery: true,
    logParams: false,
    logDuration: true,
    logUser: true,
    logDenied: true,
    retention: '30d',
  },

  permissions: {
    'view-own-orders': {
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

    'edit-org-orders': {
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

    'create-orders': {
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

    'delete-draft-orders': {
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
    analyst:  ['view-own-orders'],
    editor:   ['view-own-orders', 'edit-org-orders', 'create-orders'],
    admin:    ['view-own-orders', 'edit-org-orders', 'create-orders', 'delete-draft-orders'],
  },
})
```

### Error Responses

When a request is denied, the response includes the exact permission fix:

```json
{
  "error": "PERMISSION_DENIED",
  "message": "Role 'analyst' does not have 'select' permission on 'main.payments'",
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

- In `programmatic` mode: developer copies `fix` JSON into code, exception includes the exact JSON.
- In `admin_ui` mode: admin clicks **[+ Grant Access]** button, pre-fills the permission form.

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

### DuckDB Hardening

Dangerous DuckDB functions are blocked at the query builder level:
- `read_csv`, `read_parquet`, `read_json` (file system access)
- `COPY ... TO` (data exfiltration)
- `INSTALL`, `LOAD` (extension loading)
- `ATTACH`, `DETACH` (connection manipulation)
- `pragma` statements

### Schema Exposure

- `/schema` endpoint requires `schema_api_token`
- Disabled in production (`EXPOSE_SCHEMA=false` or `NODE_ENV=production`)
- Generated types are committed to git, used at build time

### Connection URLs

Encrypted at rest in the SQLite database. Decrypted only when attaching to DuckDB.

---

## Data Model (SQLite + Drizzle)

The app's own database stores projects, users, roles, permissions, connections, and audit logs.

```
projects
  ├── id              text PK (nanoid)
  ├── name            text NOT NULL
  ├── slug            text UNIQUE NOT NULL
  ├── mode            text NOT NULL ('admin_ui' | 'programmatic')
  ├── settings        text (JSON)
  ├── created_at      integer NOT NULL
  └── updated_at      integer NOT NULL

connections
  ├── id              text PK
  ├── project_id      text FK → projects.id
  ├── name            text NOT NULL
  ├── type            text NOT NULL ('postgres' | 'mysql' | 'sqlite' | ...)
  ├── connection_url  text NOT NULL (encrypted at rest)
  ├── is_active       integer NOT NULL DEFAULT 1
  ├── created_at      integer NOT NULL
  └── updated_at      integer NOT NULL

roles
  ├── id              text PK
  ├── project_id      text FK → projects.id
  ├── name            text NOT NULL
  ├── description     text
  ├── is_system       integer DEFAULT 0
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
  ├── filter          text (JSON: MongoDB-style conditions)
  ├── check           text (JSON: write validation)
  ├── preset          text (JSON: auto-set values)
  ├── row_limit       integer
  ├── custom_sql      text (raw SQL WHERE for power users)
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
  ├── project_id      text FK → projects.id
  ├── user_id         text FK → users.id (nullable)
  ├── ip_address      text
  ├── action          text NOT NULL ('select' | 'insert' | 'update' | 'delete')
  ├── table_name      text NOT NULL
  ├── query           text (generated SQL, if audit.logQuery = true)
  ├── params          text (JSON, if audit.logParams = true)
  ├── duration_ms     integer
  ├── status          text NOT NULL ('success' | 'denied' | 'error')
  ├── denied_reason   text (JSON: includes "fix" object for quick grant)
  ├── row_count       integer
  └── created_at      integer NOT NULL

schema_tokens
  ├── id              text PK
  ├── project_id      text FK → projects.id
  ├── token_hash      text NOT NULL (bcrypt, never raw)
  ├── name            text NOT NULL
  ├── last_used_at    integer
  ├── expires_at      integer
  ├── created_at      integer NOT NULL
  └── updated_at      integer NOT NULL
```

**Relationships:**

```
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
npx @superapp/db generate --token <schema_api_token>
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
import { createClient } from '@superapp/db/client'
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

### Schema API Token

- Generated in admin UI, scoped per project
- `/schema` endpoint checks `NODE_ENV` — returns 404 in production
- Generated types file committed to git, production uses static types
- Token stored as bcrypt hash in database

---

## Engine Modes

### `admin_ui` Mode

- Permissions managed via admin dashboard (read-write)
- Permissions stored in SQLite database
- Admin can whitelist denied queries with one click
- Full audit log with [+ Grant Access] buttons

### `programmatic` Mode

- Permissions defined in code (source of truth is the repo)
- `permissions` config is required
- Admin UI is read-only (observe, debug, test — but no editing)
- Denied queries throw `PermissionDeniedError` with exact fix JSON
- Developer copies fix into code

### Both Modes

- Same permission engine, same security guarantees
- Audit logging works in both
- Schema tokens work in both
- Same client SDK

---

## Engine Configuration (Full Example)

```typescript
import { createEngine } from '@superapp/db'
import { betterAuthProvider } from '@superapp/db/auth/better-auth'
import { postgresProvider } from '@superapp/db/integrations/postgres'
import { mysqlProvider } from '@superapp/db/integrations/mysql'
import { csvProvider } from '@superapp/db/integrations/csv'
import { createHonoMiddleware } from '@superapp/db/adapters/hono'
import { Hono } from 'hono'
import type { SuperAppSchema } from './generated/schema'

const engine = createEngine<SuperAppSchema>({
  database: './superapp.db',
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

  audit: {
    enabled: true,
    logQuery: true,
    logParams: false,
    logDuration: true,
    logUser: true,
    logDenied: true,
    retention: '30d',
  },
})

// Hono app
const app = new Hono()
app.route('/api/data', createHonoMiddleware(engine))
app.route('/admin', engine.adminHandler())

export default app
```
