# Documentation Page Index

> **Auto-generated.** Run `node scripts/generate-page-index.mjs` to regenerate.
> When adding, removing, or renaming any MDX page in `docs-site/content/`, re-run this script.

| Path | Title | Description |
|------|-------|-------------|
| `docs/index.mdx` | Introduction | A thin, secure data layer between your frontend and any database. |
| **Getting Started** | | |
| `docs/getting-started/installation.mdx` | Installation | Install the server engine and client SDK. |
| `docs/getting-started/quick-start.mdx` | Quick Start | Get running in 5 minutes. |
| **Backend** | | |
| `docs/backend/overview.mdx` | Overview | What @superapp/backend does, how it works, and what routes it exposes. |
| `docs/backend/configuration.mdx` | Configuration | Configure and initialize the superapp backend engine with connections, auth, permissions, and more. |
| **Admin UI** | | |
| `docs/backend/admin-ui/index.mdx` | Overview | Visual dashboard to configure connections, permissions, actions, limits, security, and audit logging — all from the browser. |
| `docs/backend/admin-ui/index.mdx` | Overview | Visual dashboard to configure connections, permissions, actions, limits, security, and audit logging — all from the browser. |
| `docs/backend/admin-ui/connections.mdx` | Connections | Manage database connections — add, remove, and monitor connection health from the admin dashboard. |
| `docs/backend/admin-ui/permissions-roles.mdx` | Permissions & Roles | Visual permission editor and role access matrix — manage who can access what, down to the row and column level. |
| `docs/backend/admin-ui/actions.mdx` | Actions | Browse registered server-side actions, view typed schemas, and test them from the built-in playground. |
| `docs/backend/admin-ui/limits-security.mdx` | Limits & Security | Configure rate limits, query constraints, JWT validation, CORS policies, and audit logging. |
| `docs/backend/admin-ui/audit-log.mdx` | Audit Log | Filter and inspect every query that passes through the engine — by operation, status, user, and more. |
| **Databases** | | |
| `docs/backend/databases/index.mdx` | Databases | Connect to any database with Drizzle-compatible adapters. |
| `docs/backend/databases/supported-databases.mdx` | Supported Databases | Every database supported through Drizzle ORM adapters. |
| `docs/backend/databases/postgres.mdx` | PostgreSQL | Connect to PostgreSQL databases. |
| `docs/backend/databases/mysql.mdx` | MySQL | Connect to MySQL databases. |
| `docs/backend/databases/sqlite.mdx` | SQLite | Connect to SQLite databases. |
| `docs/backend/databases/neon-serverless.mdx` | Neon Serverless | Connect to Neon via WebSocket or HTTP. |
| `docs/backend/databases/supabase.mdx` | Supabase | Connect to Supabase Postgres. |
| `docs/backend/databases/planetscale.mdx` | PlanetScale | Connect to PlanetScale serverless MySQL. |
| `docs/backend/databases/vercel-postgres.mdx` | Vercel Postgres | Connect via Vercel's managed Postgres. |
| `docs/backend/databases/libsql.mdx` | LibSQL / Turso | Connect to Turso or LibSQL databases. |
| `docs/backend/databases/d1.mdx` | Cloudflare D1 | Connect to Cloudflare D1 SQLite. |
| `docs/backend/databases/postgres-js.mdx` | Postgres.js | Connect with the postgres.js driver. |
| `docs/backend/databases/pglite.mdx` | PGlite | In-browser and in-process Postgres via WASM. |
| `docs/backend/databases/aws-data-api.mdx` | AWS Data API | Connect to Aurora Serverless via AWS RDS Data API. |
| `docs/backend/databases/bun-sqlite.mdx` | Bun SQLite | Connect using Bun's native SQLite driver. |
| `docs/backend/databases/singlestore.mdx` | SingleStore | Connect to SingleStore databases. |
| `docs/backend/databases/expo-sqlite.mdx` | Expo SQLite | Connect from React Native using Expo SQLite. |
| `docs/backend/databases/xata.mdx` | Xata | Connect to Xata serverless database. |
| `docs/backend/databases/tidb.mdx` | TiDB Cloud | Connect to TiDB Cloud serverless. |
| `docs/backend/databases/sql-js.mdx` | sql.js | In-browser SQLite via WASM. |
| `docs/backend/databases/gel.mdx` | Gel | Connect to Gel (formerly EdgeDB). |
| `docs/backend/databases/csv.mdx` | CSV | Query CSV files as tables. |
| `docs/backend/databases/custom-provider.mdx` | Custom Providers | Build a Drizzle-compatible provider for any data source. |
| **Authentication** | | |
| `docs/backend/auth/index.mdx` | Authentication | How auth providers work, the resolveSession interface, and session enrichment. |
| `docs/backend/auth/better-auth.mdx` | better-auth | Set up the default authentication provider with better-auth, user table config, and session enrichment. |
| `docs/backend/auth/custom-provider.mdx` | Custom Provider | Implement a custom authentication provider using the AuthProvider interface. |
| **Permissions** | | |
| `docs/backend/permissions/where.mdx` | Where Clauses | Restrict which rows users can read, update, and delete — grouped by operation. |
| `docs/backend/permissions/validate.mdx` | Validate | Validate data on insert and update operations before it reaches the database. |
| `docs/backend/permissions/defaults.mdx` | Defaults & Overwrite | Automatically fill missing values with default or force values with overwrite on insert and update. |
| `docs/backend/permissions/operators.mdx` | Operators | Complete reference of MongoDB-style operators available in where clauses, validate rules, and defaults. |
| `docs/backend/permissions/sql.mdx` | Raw SQL | Write advanced WHERE clauses with raw SQL for cases that standard operators cannot express. |
| `docs/backend/permissions/middleware.mdx` | Middleware | Run custom TypeScript before and after query execution — modify where clauses, transform input, restrict columns, and run side effects. |
| `docs/backend/actions.mdx` | Actions | Typed server-side functions callable by the client, with full access to the database, user session, and any table. |
| **Server Adapters** | | |
| `docs/backend/adapters/hono.mdx` | Hono | Deploy the superapp backend with Hono, the recommended adapter for Node.js and edge runtimes. |
| `docs/backend/adapters/nextjs.mdx` | Next.js | Integrate the superapp backend into a Next.js App Router project with a catch-all route handler. |
| `docs/backend/adapters/express.mdx` | Express | Add the superapp backend to an existing Express application as a router middleware. |
| `docs/backend/adapters/generic.mdx` | Generic (Workers/Deno/Bun) | Use the generic adapter for Cloudflare Workers, Deno, Bun, or any runtime with the Web Fetch API. |
| `docs/backend/adapters/pg-wire.mdx` | PostgreSQL Wire Protocol | Expose the superapp engine as a PostgreSQL-compatible server using pg-gateway. Connect with psql, DBeaver, Metabase, or any PG driver. |
| **Client** | | |
| `docs/client/overview.mdx` | Overview | Drizzle ORM for the frontend — real Drizzle with a proxy driver that returns permission-filtered data. |
| `docs/client/setup.mdx` | Setup | Configure the Drizzle ORM client with your superapp backend connection and generated schema. |
| **Queries** | | |
| `docs/client/queries/select.mdx` | Select | Fetch rows with filtering, sorting, joins, pagination, and relational queries. |
| `docs/client/queries/insert.mdx` | Insert | Insert one or more rows with type-safe values. |
| `docs/client/queries/update.mdx` | Update | Update one or more rows matching a condition. |
| `docs/client/queries/delete.mdx` | Delete | Delete one or more rows matching a condition. |
| `docs/client/queries/filtering.mdx` | Filter Operators | All Drizzle ORM filter operators for building query conditions. |
| `docs/client/queries/aggregations.mdx` | Aggregations | Count rows and compute sum, avg, min, max with Drizzle's aggregation functions. |
| **Auth** | | |
| `docs/client/auth/setup.mdx` | Setup | Configure the auth client for session management and authentication in your frontend. |
| `docs/client/auth/session.mdx` | Session Management | How sessions, tokens, and automatic refresh work in the client SDK. |
| **Components** | | |
| `docs/client/components/auth-provider.mdx` | Auth Provider | Root layout wrapper that provides auth context to all child components. |
| `docs/client/components/auth-card.mdx` | Auth Card | Pre-built sign-in, sign-up, and forgot-password UI component. |
| `docs/client/components/user-button.mdx` | User Button | Navbar dropdown component with user avatar and sign-out action. |
| `docs/client/type-generation.mdx` | Type Generation | Generate TypeScript types from your database schema for fully type-safe queries. |
| **Advanced** | | |
| `docs/advanced/architecture.mdx` | Architecture | "How the pieces fit together." |
| `docs/advanced/request-pipeline.mdx` | Request Pipeline | The complete 9-step request pipeline from incoming request to JSON response. |
| `docs/advanced/engine-modes.mdx` | Engine Modes | "Programmatic vs Interactive mode." |
| `docs/advanced/multi-database.mdx` | Multi-Database Querying | "Connect to Postgres, MySQL, SQLite, and CSV simultaneously." |
| `docs/advanced/audit-logging.mdx` | Audit Logging | Track every query with user context, parameters, duration, and automatic retention policies. |
| **Security** | | |
| `docs/advanced/security/overview.mdx` | Overview | Defense-in-depth security architecture. |
| `docs/advanced/security/session-isolation.mdx` | Session Isolation | Every request gets an isolated database connection. |
| `docs/advanced/security/jwt-validation.mdx` | JWT Validation | Algorithm allowlists and claims verification. |
| `docs/advanced/security/encryption.mdx` | Encryption | Connection secret encryption with AES-256-GCM. |
| `docs/advanced/security/request-limits.mdx` | Request Limits | Rate limiting and query constraints. |
| **Examples** | | |
| `docs/examples/orders-dashboard.mdx` | Orders Dashboard | Full CRUD example with auth, validation, and row-level security. |
| `docs/examples/multi-tenant-saas.mdx` | Multi-Tenant SaaS | Organization-scoped permissions setup. |
| **Reference** | | |
| `docs/reference/server-api/create-engine.mdx` | createEngine Options | "Complete configuration reference." |
| `docs/reference/server-api/permission-object.mdx` | Permission Object | "Complete permission shape reference." |
| `docs/reference/server-api/auth-provider.mdx` | AuthProvider Interface | "Build custom auth providers." |
| **Client API** | | |
| `docs/reference/client-api/create-client.mdx` | drizzle() Options | "Drizzle client configuration reference." |
| `docs/reference/client-api/query-methods.mdx` | Query Methods | "All Drizzle query methods available through the superapp client." |
| `docs/reference/client-api/filter-operators.mdx` | Filter Operators | "Complete Drizzle filter operator reference." |
| **HTTP API** | | |
| `docs/reference/http-api/data-endpoint.mdx` | "POST /data" | "Query endpoint request and response format." |
| `docs/reference/http-api/auth-endpoints.mdx` | Auth Endpoints | "Authentication API routes." |
| `docs/reference/http-api/schema-endpoint.mdx` | "GET /schema" | "Schema introspection endpoint." |
| **CLI** | | |
| `docs/reference/cli/create-app.mdx` | create-app | Scaffold a new project. |
| `docs/reference/cli/generate.mdx` | generate | Generate TypeScript types from your engine. |
| `docs/llms-txt.mdx` | llms.txt | Machine-readable documentation for AI agents and LLMs. |

**Total: 88 pages**
