# Architecture Summary

## The Core Idea

Superapp Backend gives every user their own permission-scoped ORM. Write normal Drizzle queries — the engine silently filters rows, restricts columns, and validates writes. Because the data layer is safe by default, you can vibe-code a frontend or expose your database through MCP without thinking about permissions. The boundary lives in the engine, not your code.

## Data Layer

The client sends Drizzle queries over HTTP via Drizzle Proxy — no direct database connection leaves the server. On the server side, native drivers (pg, mysql2, better-sqlite3) execute the actual SQL. Superapp sits in between: it intercepts every query, applies permission rules, rewrites the SQL, and forwards it to the driver. The ORM, the drivers, the wire protocol — all third-party. The only custom code is the interception.

## Permission Engine

Permissions are declared as plain objects — which roles can access which tables, which columns, under what conditions. The engine translates these into CASL rules that inject WHERE clauses into SELECTs, validate incoming data on writes, and force server-side values the client can't override. One declaration covers all four CRUD operations. No imperative permission code scattered across your app.

## Auth & HTTP

Authentication is delegated entirely to better-auth — JWT sessions, social logins, custom providers. HTTP handling is delegated to Hono, with thin adapters for Express, Next.js, and generic edge runtimes. The engine exposes a single handler function; the framework serves it. Swapping from Hono to Express is a one-line change.

## Developer Surface

For logic that goes beyond CRUD — transactions, aggregations, multi-table workflows — Actions let you write typed server functions with Zod-validated input/output. Middleware hooks let you intercept any operation before or after execution. Everything is fully typed end-to-end: the client gets autocomplete for tables, columns, actions, and return types. The goal is that a developer — or an AI agent — can build against this backend without reading a single line of engine code.
