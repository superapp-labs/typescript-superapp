# Docs Site DX Improvements Design

## Context

The superapp docs site (`docs-site/`) is built with fumadocs and has 69 MDX pages. Three improvements are needed:

1. **Visual upgrade** — Switch to purple shadcn theme, replace ASCII art with mermaid diagrams
2. **Drizzle ORM messaging** — The client SDK exposes actual Drizzle ORM with an HTTP driver plugin, not a custom query API. All docs must reflect this.
3. **Nav polish** — GitHub link, branding

## 1. Purple Theme

Change one CSS import in `docs-site/app/global.css`:

```css
/* Before */
@import 'fumadocs-ui/css/neutral.css';

/* After */
@import 'fumadocs-ui/css/purple.css';
```

No other changes needed. fumadocs maps shadcn color tokens automatically.

## 2. Mermaid Diagram Support

### Setup

1. Install `mermaid` package
2. Create a `components/mermaid.tsx` client component that renders mermaid diagrams with theme sync (light/dark)
3. Register the component in `mdx-components.tsx` to handle ` ```mermaid ` code blocks

### Pages to Update (replace ASCII → mermaid)

| Page | Diagram Type | Content |
|------|-------------|---------|
| `index.mdx` | flowchart TD | Architecture overview: Frontend → HTTP+JWT → Backend → DuckDB → databases |
| `concepts/architecture.mdx` | flowchart TD + sequence | System diagram + request lifecycle |
| `backend/request-pipeline.mdx` | sequence | 10-step pipeline: HTTP → Auth → Permissions → Query → DuckDB → Response |
| `concepts/how-permissions-work.mdx` | flowchart LR | Permission evaluation: role → permissions → filter/check/preset → SQL |
| `concepts/multi-database-querying.mdx` | flowchart TD | DuckDB ATTACH: query → DuckDB → Postgres/MySQL/SQLite/CSV |
| `concepts/security-model.mdx` | flowchart TD | Defense layers: JWT → Permissions → DuckDB isolation → Audit |
| `client/overview.mdx` | flowchart LR | Client → HTTP driver → Backend → Database |
| `backend/overview.mdx` | flowchart TD | Server components diagram |

## 3. Drizzle ORM Messaging Overhaul

### Key Insight

The client SDK is **not** a custom query builder. It exposes **actual Drizzle ORM** with a custom HTTP driver plugin that talks to the superapp backend. Developers use real Drizzle syntax:

```typescript
// This is REAL Drizzle ORM, not a wrapper
import { drizzle } from 'drizzle-orm/superapp'
import { eq, gt, desc } from 'drizzle-orm'
import * as schema from './generated/schema'

const db = drizzle({
  connection: 'http://localhost:3001',
  token: session.token,
  schema,
})

// Standard Drizzle queries — permissions enforced transparently
const orders = await db.select()
  .from(schema.orders)
  .where(eq(schema.orders.status, 'active'))
  .orderBy(desc(schema.orders.createdAt))
  .limit(50)

// Relational queries work too
const ordersWithCustomer = await db.query.orders.findMany({
  with: { customer: true },
  where: eq(schema.orders.status, 'active'),
})
```

### Pages to Rewrite

**Client section (full rewrite):**

| Page | Changes |
|------|---------|
| `client/overview.mdx` | Position as "Drizzle ORM for the frontend". Show it's real Drizzle with HTTP driver. Comparison table: standard Drizzle vs superapp Drizzle (same API, but permissions enforced). |
| `client/create-client.mdx` | Show `drizzle()` setup with HTTP driver plugin. Schema import from generated types. |
| `client/queries/find-many.mdx` | Rewrite to `db.select().from(table).where()` and `db.query.table.findMany()` syntax |
| `client/queries/find-one.mdx` | Rewrite to `db.query.table.findFirst()` syntax |
| `client/queries/create.mdx` | Rewrite to `db.insert(table).values()` syntax |
| `client/queries/update.mdx` | Rewrite to `db.update(table).set().where()` syntax |
| `client/queries/delete.mdx` | Rewrite to `db.delete(table).where()` syntax |
| `client/queries/count.mdx` | Rewrite to `db.select({ count: count() }).from(table)` syntax |
| `client/queries/aggregate.mdx` | Rewrite to `db.select({ total: sum(table.amount) }).from(table)` syntax |
| `client/queries/filtering.mdx` | Rewrite to Drizzle operators: `eq()`, `ne()`, `gt()`, `gte()`, `lt()`, `lte()`, `in()`, `like()`, `ilike()`, `isNull()`, `and()`, `or()`, `not()` |
| `client/type-generation.mdx` | Update to show Drizzle schema format output |

**New page:**

| Page | Content |
|------|---------|
| `client/drizzle-compatibility.mdx` | Side-by-side: standard Drizzle (direct DB) vs superapp Drizzle (HTTP + permissions). Same syntax, different transport. What's supported, what's restricted (no raw SQL, no transactions). |

**Pages with code example updates:**

| Page | Changes |
|------|---------|
| `index.mdx` | Update quick example to use Drizzle syntax |
| `getting-started/quick-start.mdx` | Update step 3-5 to use Drizzle syntax |
| `examples/orders-dashboard.mdx` | Update to Drizzle syntax |
| `examples/multi-tenant-saas.mdx` | Update client section to Drizzle syntax |
| `api-reference/client/create-client.mdx` | Update to Drizzle driver setup |
| `api-reference/client/query-methods.mdx` | Update to Drizzle methods |
| `api-reference/client/filter-operators.mdx` | Update to Drizzle operators |

## 4. Nav & Branding

In `app/layout.config.tsx`:

```typescript
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: 'superapp',
  },
  links: [
    { text: 'Docs', url: '/docs', active: 'nested-url' },
    {
      text: 'GitHub',
      url: 'https://github.com/user/superapp-backend',
      icon: <GithubIcon />,
      external: true,
    },
  ],
}
```

## Implementation Order

1. Theme switch (1 min)
2. Mermaid setup + component (15 min)
3. Drizzle client docs rewrite — all query pages (largest chunk)
4. Mermaid diagram replacements across concept/architecture pages
5. Nav polish
6. Build verification

## Files Changed

- `app/global.css` — theme import
- `source.config.ts` — mermaid remark plugin (if needed)
- `components/mermaid.tsx` — new client component
- `mdx-components.tsx` — register mermaid
- `app/layout.config.tsx` — nav links
- 11 client SDK MDX files — full rewrite to Drizzle syntax
- 1 new MDX file (`client/drizzle-compatibility.mdx`)
- 7 architecture/concept MDX files — ASCII → mermaid
- 5 other MDX files — code example updates to Drizzle syntax
- `content/docs/client/meta.json` — add drizzle-compatibility entry
