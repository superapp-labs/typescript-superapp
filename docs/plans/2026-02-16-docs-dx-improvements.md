# Docs DX Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the docs site with purple theme, mermaid diagrams (replacing ASCII art), and rewrite all client SDK docs to reflect the actual Drizzle ORM API.

**Architecture:** Three independent workstreams: (1) theme/mermaid infrastructure, (2) Drizzle client SDK content rewrite, (3) mermaid diagram replacements in architecture/concept pages. Infrastructure must land first, then content rewrites can be parallelized.

**Tech Stack:** fumadocs-ui purple theme, mermaid (client-side rendering via custom MDX component), Drizzle ORM syntax throughout client docs.

---

### Task 1: Switch to Purple Theme

**Files:**
- Modify: `docs-site/app/global.css`

**Step 1: Change the CSS import**

```css
@import 'tailwindcss';
@import 'fumadocs-ui/css/purple.css';
@import 'fumadocs-ui/css/preset.css';
```

**Step 2: Build to verify**

Run: `cd docs-site && npm run build 2>&1 | tail -5`
Expected: Build succeeds with all pages generated

**Step 3: Commit**

```bash
git add docs-site/app/global.css
git commit -m "Switch docs theme from neutral to purple"
```

---

### Task 2: Add Mermaid Diagram Support

**Files:**
- Create: `docs-site/components/mermaid.tsx`
- Modify: `docs-site/mdx-components.tsx`
- Modify: `docs-site/package.json` (install mermaid)

**Step 1: Install mermaid**

Run: `cd docs-site && npm install mermaid`

**Step 2: Create the Mermaid client component**

Create `docs-site/components/mermaid.tsx` as a `'use client'` React component:
- Initialize mermaid with `startOnLoad: false` and `securityLevel: 'loose'`
- Use `useEffect` + `useRef` to render mermaid charts
- Call `mermaid.render()` with a unique ID and the chart string
- Set rendered SVG into ref via safe DOM assignment (mermaid output is self-generated, not user input)
- Wrap output in div with `className="my-4 flex justify-center [&_svg]:max-w-full"`

**Step 3: Register in mdx-components.tsx**

Update `docs-site/mdx-components.tsx` to:
- Import the Mermaid component
- Add it to the components map
- Override `pre` to detect `language-mermaid` code blocks and render them as `<Mermaid chart={...} />`

**Step 4: Build to verify**

Run: `cd docs-site && rm -rf .next && npm run build 2>&1 | tail -5`

**Step 5: Commit**

```bash
git add docs-site/components/mermaid.tsx docs-site/mdx-components.tsx docs-site/package.json docs-site/package-lock.json
git commit -m "Add mermaid diagram support for MDX pages"
```

---

### Task 3: Add GitHub Link to Nav

**Files:**
- Modify: `docs-site/app/layout.config.tsx`

**Step 1: Update layout config**

Add a GitHub link to the `links` array:

```tsx
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: 'superapp',
  },
  links: [
    {
      text: 'Docs',
      url: '/docs',
      active: 'nested-url',
    },
    {
      text: 'GitHub',
      url: 'https://github.com/user/superapp-backend',
      external: true,
    },
  ],
}
```

**Step 2: Commit**

```bash
git add docs-site/app/layout.config.tsx
git commit -m "Add GitHub link to docs nav"
```

---

### Task 4: Add Drizzle Compatibility Page + Update Client Meta

**Files:**
- Create: `docs-site/content/docs/client/drizzle-compatibility.mdx`
- Modify: `docs-site/content/docs/client/meta.json`

**Step 1: Update client meta.json to include new page**

```json
{
  "title": "Client SDK",
  "pages": [
    "overview",
    "create-client",
    "drizzle-compatibility",
    "queries",
    "auth",
    "components",
    "type-generation"
  ]
}
```

**Step 2: Create drizzle-compatibility.mdx**

Content includes:
- Intro: The `@superapp/db` client is real Drizzle ORM with a custom HTTP driver
- Side-by-side comparison table: standard Drizzle vs superapp Drizzle (transport, permissions, auth, setup, query syntax, schema, raw SQL, transactions)
- Code comparison: standard Drizzle setup vs superapp setup with identical query syntax
- "What's Supported" list: all Drizzle query builder methods (select, insert, update, delete, query.findMany, query.findFirst, all filter operators, aggregations)
- "What's Restricted" table: raw SQL (blocked), transactions (not supported), DDL (blocked)
- "Why This Matters" — if you know Drizzle, you know the superapp client

**Step 3: Commit**

```bash
git add docs-site/content/docs/client/drizzle-compatibility.mdx docs-site/content/docs/client/meta.json
git commit -m "Add Drizzle ORM compatibility page"
```

---

### Task 5: Rewrite Client Overview + createClient to Drizzle API

**Files:**
- Modify: `docs-site/content/docs/client/overview.mdx`
- Modify: `docs-site/content/docs/client/create-client.mdx`

**Step 1: Rewrite client/overview.mdx**

Key changes:
- Position as "Drizzle ORM for the frontend"
- Show `drizzle()` import from `@superapp/db`
- Replace `db.main.orders.findMany()` with `db.select().from(schema.orders)`
- Update methods table: `db.select()`, `db.insert()`, `db.update()`, `db.delete()`, `db.query.*.findMany()`, `db.query.*.findFirst()`
- Update imports table: `drizzle` from `@superapp/db`, operators from `drizzle-orm`
- Add mermaid flowchart: Client -> HTTP Driver -> Backend -> Permission Engine -> Database

**Step 2: Rewrite client/create-client.mdx**

- Title: "Setting Up the Client"
- Replace `createClient<SuperAppSchema>({ url, userToken })` with `drizzle({ connection, token, schema })`
- Options table: `connection` (string), `token` (string), `schema` (object)
- Setup file uses `drizzle()`, useDb hook stays same pattern

**Step 3: Build to verify**

Run: `cd docs-site && rm -rf .next && npm run build 2>&1 | tail -5`

**Step 4: Commit**

```bash
git add docs-site/content/docs/client/overview.mdx docs-site/content/docs/client/create-client.mdx
git commit -m "Rewrite client overview and createClient to Drizzle ORM API"
```

---

### Task 6: Rewrite All Query Pages to Drizzle Syntax

**Files:**
- Modify: `docs-site/content/docs/client/queries/find-many.mdx`
- Modify: `docs-site/content/docs/client/queries/find-one.mdx`
- Modify: `docs-site/content/docs/client/queries/create.mdx`
- Modify: `docs-site/content/docs/client/queries/update.mdx`
- Modify: `docs-site/content/docs/client/queries/delete.mdx`
- Modify: `docs-site/content/docs/client/queries/count.mdx`
- Modify: `docs-site/content/docs/client/queries/aggregate.mdx`
- Modify: `docs-site/content/docs/client/queries/filtering.mdx`

**API Mapping:**

| Old API | New Drizzle API |
|---------|----------------|
| `db.main.orders.findMany({ select, where, orderBy, limit })` | `db.select().from(schema.orders).where(eq(...)).orderBy(desc(...)).limit(50)` and `db.query.orders.findMany({ with, where, orderBy, limit })` |
| `db.main.orders.findOne({ where })` | `db.query.orders.findFirst({ where })` |
| `db.main.orders.create({ data })` | `db.insert(schema.orders).values({ ... })` |
| `db.main.orders.update({ where, data })` | `db.update(schema.orders).set({ ... }).where(eq(...))` |
| `db.main.orders.delete({ where })` | `db.delete(schema.orders).where(eq(...))` |
| `db.main.orders.count({ where })` | `db.select({ count: count() }).from(schema.orders).where(...)` |
| `db.main.orders.aggregate({ sum, avg, groupBy })` | `db.select({ total: sum(schema.orders.amount) }).from(schema.orders).groupBy(...)` |

**Filter Operator Mapping:**

| Old | New (from drizzle-orm) |
|-----|----------------------|
| `$eq` | `eq()` |
| `$ne` | `ne()` |
| `$gt` | `gt()` |
| `$gte` | `gte()` |
| `$lt` | `lt()` |
| `$lte` | `lte()` |
| `$in` | `inArray()` |
| `$nin` | `notInArray()` |
| `$like` | `like()` |
| `$ilike` | `ilike()` |
| `$is_null` | `isNull()` |
| `$and` | `and()` |
| `$or` | `or()` |
| `$not` | `not()` |

Each page keeps same structure (basic, with options, complex) but all code uses Drizzle syntax.

**Step 2: Build to verify**

Run: `cd docs-site && rm -rf .next && npm run build 2>&1 | tail -5`

**Step 3: Commit**

```bash
git add docs-site/content/docs/client/queries/
git commit -m "Rewrite all query pages to Drizzle ORM syntax"
```

---

### Task 7: Update Introduction, Quick Start, and Examples to Drizzle Syntax

**Files:**
- Modify: `docs-site/content/docs/index.mdx`
- Modify: `docs-site/content/docs/getting-started/quick-start.mdx`
- Modify: `docs-site/content/docs/examples/orders-dashboard.mdx`
- Modify: `docs-site/content/docs/examples/multi-tenant-saas.mdx`

**Step 1: Update index.mdx**

- Replace ASCII architecture diagram with mermaid flowchart
- Change client example from `createClient` to `drizzle()`
- Change query from `db.main.orders.findMany(...)` to `db.select().from(schema.orders).where(...)`
- Add mention: "The client SDK exposes full Drizzle ORM with an HTTP driver"

**Step 2: Update quick-start.mdx**

- Step 3: Change `createClient` setup to `drizzle()` setup
- Step 5: Change query examples to Drizzle syntax
- Replace "What You Just Built" ASCII diagram with mermaid sequence diagram

**Step 3: Update orders-dashboard.mdx**

- Replace `db.main.orders.findMany(...)` with `db.query.orders.findMany({ with: { customer: true }, ... })`
- Update `useDb` hook to use `drizzle()`

**Step 4: Update multi-tenant-saas.mdx**

- Update client usage section to Drizzle syntax

**Step 5: Build to verify**

Run: `cd docs-site && rm -rf .next && npm run build 2>&1 | tail -5`

**Step 6: Commit**

```bash
git add docs-site/content/docs/index.mdx docs-site/content/docs/getting-started/quick-start.mdx docs-site/content/docs/examples/
git commit -m "Update intro, quick start, and examples to Drizzle syntax"
```

---

### Task 8: Update API Reference Pages to Drizzle Syntax

**Files:**
- Modify: `docs-site/content/docs/api-reference/client/create-client.mdx`
- Modify: `docs-site/content/docs/api-reference/client/query-methods.mdx`
- Modify: `docs-site/content/docs/api-reference/client/filter-operators.mdx`

**Step 1: Rewrite create-client.mdx** — `drizzle()` setup with options table

**Step 2: Rewrite query-methods.mdx** — All 7 methods as Drizzle equivalents with type signatures

**Step 3: Rewrite filter-operators.mdx** — All operators as Drizzle functions from `drizzle-orm`

**Step 4: Build to verify**

Run: `cd docs-site && rm -rf .next && npm run build 2>&1 | tail -5`

**Step 5: Commit**

```bash
git add docs-site/content/docs/api-reference/client/
git commit -m "Update API reference client pages to Drizzle syntax"
```

---

### Task 9: Replace ASCII Diagrams with Mermaid in Architecture/Concept Pages

**Files:**
- Modify: `docs-site/content/docs/concepts/architecture.mdx`
- Modify: `docs-site/content/docs/concepts/how-permissions-work.mdx`
- Modify: `docs-site/content/docs/concepts/multi-database-querying.mdx`
- Modify: `docs-site/content/docs/concepts/security-model.mdx`
- Modify: `docs-site/content/docs/backend/overview.mdx`
- Modify: `docs-site/content/docs/backend/request-pipeline.mdx`

**Step 1: Replace diagrams in each file**

Use `flowchart TD` for hierarchical diagrams, `flowchart LR` for process flows. Key diagrams:
- **architecture.mdx**: System diagram (Frontend, Backend, DuckDB, Databases) + dependency graph
- **request-pipeline.mdx**: 10-step pipeline as vertical flowchart
- **how-permissions-work.mdx**: Permission evaluation flow
- **multi-database-querying.mdx**: DuckDB ATTACH flow
- **security-model.mdx**: Defense-in-depth layers
- **backend/overview.mdx**: Server components overview

Also update any `createClient`/`findMany` references to Drizzle syntax.

**Step 2: Build to verify**

Run: `cd docs-site && rm -rf .next && npm run build 2>&1 | tail -5`

**Step 3: Commit**

```bash
git add docs-site/content/docs/concepts/ docs-site/content/docs/backend/overview.mdx docs-site/content/docs/backend/request-pipeline.mdx
git commit -m "Replace ASCII diagrams with mermaid in architecture and concept pages"
```

---

### Task 10: Final Build Verification

**Files:** None (verification only)

**Step 1: Clean build**

Run: `cd docs-site && rm -rf .next && npm run build 2>&1 | tail -10`
Expected: All 75 pages generate (74 original + 1 new drizzle-compatibility), no errors

**Step 2: Verify page count matches**

**Step 3: Final commit if needed**
