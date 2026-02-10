# @superapp/backend — Full Server Configuration

Single-file reference showing every option available when configuring the backend engine.

---

## Complete `createEngine` Config

```typescript
// server.ts — full backend configuration in one file

import { createEngine } from '@superapp/backend'
import { betterAuthProvider } from '@superapp/backend/auth/better-auth'
import { postgresProvider } from '@superapp/backend/integrations/postgres'
import { mysqlProvider } from '@superapp/backend/integrations/mysql'
import { sqliteProvider } from '@superapp/backend/integrations/sqlite'
import { csvProvider } from '@superapp/backend/integrations/csv'
import { createHonoMiddleware } from '@superapp/backend/adapters/hono'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'

// ─── Auth Provider ────────────────────────────────────────────────

const auth = betterAuthProvider({
  secret: process.env.AUTH_SECRET!,

  // Map JWT claims to a user row in your connected database
  userTable: {
    table: 'main.users',                           // connection.table
    matchOn: { column: 'id', jwtField: 'id' },     // which column matches JWT sub
    activeCheck: { column: 'is_active', value: true }, // reject inactive users
    columns: ['id', 'email', 'name'],               // fields to select from user row
  },

  // Enrich the session with additional data (org memberships, etc.)
  // Whatever you return here becomes the $user object in permissions.
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
      current_org_id: memberships[0]?.organization_id ?? null,
    }
  },
})

// ─── Engine ───────────────────────────────────────────────────────

const engine = createEngine({
  // ── Mode ──────────────────────────────────────────────────────
  // 'programmatic' — permissions defined in code (this file)
  // 'admin_ui'     — permissions managed via the /admin dashboard
  mode: 'programmatic',

  // ── App Database ──────────────────────────────────────────────
  // Turso (libSQL) stores projects, roles, permissions, audit logs.
  // Local file for dev, Turso URL for production.
  database: process.env.TURSO_URL ?? './superapp.db',

  // ── Integration Providers ─────────────────────────────────────
  // Register which provider types are available.
  // Each provider knows how to ATTACH to DuckDB or execute queries.
  integrations: [
    postgresProvider,
    mysqlProvider,
    sqliteProvider,
    csvProvider,
  ],

  // ── Connections ───────────────────────────────────────────────
  // Named connections to external databases.
  // Names become the first segment in table paths: main.orders, warehouse.events
  connections: {
    main: {
      type: 'postgres',
      url: process.env.PG_URL!,
    },
    warehouse: {
      type: 'mysql',
      url: process.env.MYSQL_URL!,
    },
    local: {
      type: 'sqlite',
      url: './data/local.db',
    },
    reports: {
      type: 'csv',
      url: './data/reports/',  // directory of CSV files
    },
  },

  // ── Auth ──────────────────────────────────────────────────────
  auth,

  // ── DuckDB Instance Settings ──────────────────────────────────
  duckdb: {
    maxMemory: '256MB',      // per-session memory limit
    threads: 2,              // per-session thread limit
    queryTimeout: 30_000,    // 30s max query execution
    poolSize: 10,            // pre-warmed instance pool size
    idleTimeout: 300_000,    // 5 min session idle before recycle
  },

  // ── Request Limits ────────────────────────────────────────────
  limits: {
    maxLimit: 10_000,              // max rows per findMany
    maxIncludeDepth: 3,            // max relationship nesting
    maxFilterDepth: 5,             // max nested $and/$or/FK traversal
    maxFilterConditions: 50,       // max conditions per where clause
    maxRequestBodySize: '1MB',     // max HTTP body
    queryTimeout: 30_000,          // duplicated here for clarity
    rateLimitPerUser: 200,         // queries per user per minute
    rateLimitPerIP: 500,           // queries per IP per minute
  },

  // ── Audit Logging ─────────────────────────────────────────────
  audit: {
    enabled: true,
    logQuery: true,           // log generated SQL
    logParams: true,          // log query parameters (disable if PII concerns)
    logDuration: true,        // log execution time
    logUser: true,            // log user id/email
    logDenied: true,          // log permission denials with full diagnostic
    logAdminActions: true,    // log all admin UI mutations
    retention: '90d',         // auto-delete after 90 days (up to 7 years)
    piiRedaction: false,      // when true, hashes param values
  },

  // ── Schema Endpoint ───────────────────────────────────────────
  // Used by `npx @superapp/backend generate` to introspect the schema.
  // Off by default. Requires a schema_api_token to access.
  schemaEndpoint: process.env.NODE_ENV !== 'production',

  // ── JWT Validation ────────────────────────────────────────────
  jwt: {
    algorithms: ['RS256', 'ES256'],  // allowlist (no HS256, no 'none')
    issuer: 'https://auth.myapp.com',
    audience: 'https://api.myapp.com',
    clockSkewSeconds: 30,
  },

  // ── Security Headers ──────────────────────────────────────────
  security: {
    cors: {
      origin: ['https://myapp.com', 'https://admin.myapp.com'],
      credentials: true,
    },
    csp: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'",
    adminIpAllowlist: ['10.0.0.0/8'],  // optional: restrict admin access by IP
  },

  // ── Encryption ────────────────────────────────────────────────
  // Master key for encrypting connection URLs (AES-256-GCM, HKDF per-project).
  masterKey: process.env.SUPERAPP_MASTER_KEY!,

  // ── Permissions (programmatic mode) ───────────────────────────
  permissions: {
    view_own_orders: {
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

    edit_org_orders: {
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
        amount: { $gte: 0, $lte: 100_000 },
      },
      preset: { updated_by: '$user.id' },
    },

    create_orders: {
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

    delete_draft_orders: {
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

    view_customers: {
      name: 'View customers',
      description: 'Read customers within own org',
      table: 'main.customers',
      operations: { select: true },
      columns: ['id', 'name', 'email'],
      filter: {
        organization: {
          members: { user_id: { $eq: '$user.id' } },
        },
      },
    },

    view_warehouse_events: {
      name: 'View warehouse events',
      description: 'Read-only access to warehouse analytics',
      table: 'warehouse.events',
      operations: { select: true },
      columns: '*',
      filter: {
        org_id: { $in: '$user.org_ids' },
      },
      limit: 5000,
    },

    advanced_reporting: {
      name: 'Advanced reporting access',
      description: 'Custom SQL for complex reporting queries',
      table: 'main.orders',
      operations: { select: true },
      columns: '*',
      customSql: {
        where: 'organization_id IN (SELECT org_id FROM reporting_access WHERE user_id = :user_id AND level >= :min_level)',
        params: { user_id: '$user.id', min_level: 3 },
      },
    },
  },

  // ── Roles ─────────────────────────────────────────────────────
  // Map role names to arrays of permission slugs.
  roles: {
    viewer: [
      'view_own_orders',
      'view_customers',
    ],
    analyst: [
      'view_own_orders',
      'view_customers',
      'view_warehouse_events',
      'advanced_reporting',
    ],
    editor: [
      'view_own_orders',
      'view_customers',
      'edit_org_orders',
      'create_orders',
    ],
    admin: [
      'view_own_orders',
      'view_customers',
      'view_warehouse_events',
      'edit_org_orders',
      'create_orders',
      'delete_draft_orders',
      'advanced_reporting',
    ],
  },
})

// ─── HTTP Server (Hono adapter) ───────────────────────────────────

const app = new Hono()

// Mount the engine — handles /data, /auth, /admin, /schema
app.route('/', createHonoMiddleware(engine))

serve({ fetch: app.fetch, port: 3001 }, (info) => {
  console.log(`@superapp/backend running on http://localhost:${info.port}`)
  console.log(`  Data endpoint:  http://localhost:${info.port}/data`)
  console.log(`  Auth endpoint:  http://localhost:${info.port}/auth`)
  console.log(`  Admin UI:       http://localhost:${info.port}/admin`)
})
```

---

## Alternative Adapters

### Next.js (App Router)

```typescript
// app/api/[...superapp]/route.ts
import { createNextHandler } from '@superapp/backend/adapters/next'
import { engine } from '@/lib/engine'  // same createEngine config above

const handler = createNextHandler(engine)

export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler
```

### Express

```typescript
// server.ts
import express from 'express'
import { createExpressRouter } from '@superapp/backend/adapters/express'
import { engine } from './engine'

const app = express()
app.use('/', createExpressRouter(engine))
app.listen(3001)
```

### Generic (any Request/Response runtime)

```typescript
// worker.ts (Cloudflare Workers, Deno, Bun, etc.)
import { createHandler } from '@superapp/backend/adapters/generic'
import { engine } from './engine'

const handler = createHandler(engine)

export default {
  fetch: (req: Request) => handler(req),
}
```

---

## Environment Variables

```bash
# .env
AUTH_SECRET=your-auth-secret-min-32-chars
PG_URL=postgres://user:pass@localhost:5432/mydb
MYSQL_URL=mysql://user:pass@localhost:3306/warehouse
TURSO_URL=libsql://your-db.turso.io?authToken=xxx
SUPERAPP_MASTER_KEY=your-256-bit-master-key-hex
NODE_ENV=development
```

---

## Routes Exposed by the Engine

| Route | Purpose |
|-------|---------|
| `POST /data` | Query endpoint — accepts structured JSON, returns results |
| `/auth/*` | better-auth endpoints (login, signup, session, etc.) |
| `/admin` | Admin UI (React SPA, static assets) |
| `/admin/api/*` | Admin API (CRUD for roles, permissions, connections, users) |
| `GET /schema` | Schema introspection (requires `schema_api_token`, opt-in) |

---

## Request Pipeline

```
HTTP request arrives
  │
  ├─ 1. Rate limit check (per-user + per-IP)
  ├─ 2. Request body validation (size, shape)
  ├─ 3. JWT extraction from Authorization header
  ├─ 4. auth.resolveSession(token, db) → $user object
  ├─ 5. Engine auto-injects roles[] and permissions[] from app DB
  ├─ 6. Permission check:
  │     ├─ Table access? (does role have any permission on this table?)
  │     ├─ Operation access? (select/insert/update/delete)
  │     ├─ Column access? (strip unpermitted columns)
  │     ├─ WHERE injection (filter → Kysely → SQL)
  │     ├─ FK validation (for writes with FK columns)
  │     └─ Check validation (for insert/update data)
  ├─ 7. Query builder: structured JSON → Kysely → SQL
  ├─ 8. DuckDB execution (session-isolated instance)
  ├─ 9. Audit log entry written
  └─ 10. Response returned (sanitized errors in production)
```
