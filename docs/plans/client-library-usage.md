# @superapp/db — Client Library with Auth & Data Queries

Single-file reference showing everything a frontend developer needs to set up auth and query tables.

---

## Complete Client Setup

```typescript
// lib/superapp.ts — full client configuration in one file

import { createClient } from '@superapp/db'
import { createAuth } from '@superapp/db/auth'
import type { SuperAppSchema } from '../generated/schema'

// ─── Configuration ────────────────────────────────────────────────

const SUPERAPP_URL = process.env.NEXT_PUBLIC_SUPERAPP_URL!
// e.g. 'https://api.myapp.com' or 'http://localhost:3001'

// ─── Auth Client ──────────────────────────────────────────────────
// Creates a better-auth client pointing at the engine's /auth endpoint.
// Handles login, signup, session management, token refresh.

export const authClient = createAuth(SUPERAPP_URL)

// ─── Data Client Factory ──────────────────────────────────────────
// Creates a typed query client pointing at the engine's /data endpoint.
// Pass the user's JWT to authenticate every query.

export function createDb(userToken: string) {
  return createClient<SuperAppSchema>({
    url: SUPERAPP_URL + '/data',
    userToken,
  })
}
```

---

## Auth UI Components

### Root Layout (AuthProvider)

```tsx
// app/layout.tsx
import { AuthProvider } from '@superapp/db/components'
import { authClient } from '@/lib/superapp'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  return (
    <html lang="en">
      <body>
        <AuthProvider
          authClient={authClient}
          navigate={router.push}
          replace={router.replace}
          Link={Link}
          onSessionChange={() => router.refresh()}
        >
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### Auth Page (Sign In / Sign Up / Forgot Password)

```tsx
// app/auth/[[...slug]]/page.tsx
import { AuthCard } from '@superapp/db/components'

// Renders the right form based on URL:
//   /auth/sign-in          → sign in form
//   /auth/sign-up          → sign up form
//   /auth/forgot-password  → password reset form
export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <AuthCard />
    </div>
  )
}
```

### User Button (Navbar)

```tsx
// components/navbar.tsx
import { UserButton } from '@superapp/db/components'
import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b">
      <Link href="/">MyApp</Link>
      <UserButton />
    </nav>
  )
}
```

---

## Querying Tables

### Getting the User Token

```tsx
// hooks/use-db.ts
import { useMemo } from 'react'
import { useSession } from '@superapp/db/auth'  // or from better-auth/react
import { createDb } from '@/lib/superapp'

export function useDb() {
  const { data: session } = useSession()
  return useMemo(
    () => session?.token ? createDb(session.token) : null,
    [session?.token],
  )
}
```

### findMany — Fetch Multiple Rows

```typescript
// Fetch active orders, sorted by newest first
const orders = await db.main.orders.findMany({
  select: ['id', 'amount', 'status', 'created_at'],
  where: { status: { $eq: 'active' } },
  orderBy: { created_at: 'desc' },
  limit: 50,
  offset: 0,
})
// → { id: number, amount: number, status: string, created_at: Date }[]

// With relationship includes
const ordersWithCustomer = await db.main.orders.findMany({
  select: ['id', 'amount', 'status'],
  include: { customer: ['name', 'email'] },
  where: { amount: { $gte: 1000 } },
})
// → { id, amount, status, customer: { name, email } }[]

// Complex filters
const filtered = await db.main.orders.findMany({
  where: {
    $and: [
      { status: { $in: ['active', 'draft'] } },
      { amount: { $gte: 500, $lte: 10000 } },
      { created_at: { $gte: new Date('2026-01-01') } },
    ],
  },
  orderBy: { amount: 'desc' },
  limit: 100,
})

// Pattern matching
const search = await db.main.customers.findMany({
  where: { name: { $ilike: '%john%' } },
  select: ['id', 'name', 'email'],
})
```

### findOne — Fetch a Single Row

```typescript
const order = await db.main.orders.findOne({
  where: { id: { $eq: 42 } },
  include: { customer: ['name'] },
})
// → { id, amount, status, ..., customer: { name } } | null
```

### create — Insert a New Row

```typescript
const newOrder = await db.main.orders.create({
  data: {
    amount: 5000,
    status: 'draft',
    customer_id: 42,
  },
})
// → { id: 123, amount: 5000, status: 'draft', ... }
// Note: created_by and organization_id are auto-set by permission presets
```

### update — Update Existing Rows

```typescript
await db.main.orders.update({
  where: { id: { $eq: 123 } },
  data: { status: 'active' },
})
// Note: updated_by is auto-set by permission presets

// Update multiple rows matching a filter
await db.main.orders.update({
  where: {
    status: { $eq: 'draft' },
    created_at: { $lt: new Date('2026-01-01') },
  },
  data: { status: 'closed' },
})
```

### delete — Delete Rows

```typescript
await db.main.orders.delete({
  where: { id: { $eq: 123 } },
})

// Delete by filter
await db.main.orders.delete({
  where: { status: { $eq: 'draft' } },
})
```

### count — Count Matching Rows

```typescript
const total = await db.main.orders.count({
  where: { status: { $eq: 'active' } },
})
// → { count: 847 }
```

### aggregate — Run Aggregations

```typescript
const stats = await db.main.orders.aggregate({
  where: { status: { $eq: 'active' } },
  sum: 'amount',
  avg: 'amount',
  min: 'amount',
  max: 'amount',
})
// → { sum_amount: 500000, avg_amount: 590, min_amount: 10, max_amount: 99000 }

// Grouped aggregation
const byStatus = await db.main.orders.aggregate({
  groupBy: ['status'],
  sum: 'amount',
  count: true,
})
// → [
//     { status: 'active', sum_amount: 400000, count: 312 },
//     { status: 'draft', sum_amount: 100000, count: 85 },
//   ]
```

---

## Full Page Example — Orders Dashboard

```tsx
// app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useDb } from '@/hooks/use-db'

type Order = {
  id: number
  amount: number
  status: string
  created_at: Date
  customer: { name: string }
}

export default function DashboardPage() {
  const db = useDb()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db) return

    db.main.orders
      .findMany({
        select: ['id', 'amount', 'status', 'created_at'],
        include: { customer: ['name'] },
        where: { status: { $in: ['active', 'draft'] } },
        orderBy: { created_at: 'desc' },
        limit: 50,
      })
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [db])

  if (!db) return <p>Please sign in.</p>
  if (loading) return <p>Loading...</p>

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-4">Orders</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-slate-400 border-b">
            <th className="py-2">ID</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b hover:bg-slate-800/50">
              <td className="py-3">{o.id}</td>
              <td>{o.customer.name}</td>
              <td>${(o.amount / 100).toFixed(2)}</td>
              <td>{o.status}</td>
              <td>{new Date(o.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## Full Page Example — Create Order Form

```tsx
// app/orders/new/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDb } from '@/hooks/use-db'

export default function NewOrderPage() {
  const db = useDb()
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!db) return

    try {
      await db.main.orders.create({
        data: {
          amount: Math.round(parseFloat(amount) * 100),
          status: 'draft',
          customer_id: parseInt(customerId, 10),
        },
      })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message ?? 'Failed to create order')
    }
  }

  if (!db) return <p>Please sign in.</p>

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-8 space-y-4">
      <h1 className="text-xl font-semibold">New Order</h1>

      <input
        type="number"
        placeholder="Amount ($)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full px-3 py-2 border rounded"
        step="0.01"
        required
      />

      <input
        type="number"
        placeholder="Customer ID"
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
        className="w-full px-3 py-2 border rounded"
        required
      />

      {error && <p className="text-rose-500 text-sm">{error}</p>}

      <button
        type="submit"
        className="w-full bg-indigo-500 text-white py-2 rounded hover:bg-indigo-400"
      >
        Create Order
      </button>
    </form>
  )
}
```

---

## Filter Operators Reference

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
| `$like` | Pattern match (case-sensitive) | `{ name: { $like: '%john%' } }` |
| `$ilike` | Pattern match (case-insensitive) | `{ name: { $ilike: '%john%' } }` |
| `$is_null` | Is null check | `{ deleted_at: { $is_null: true } }` |
| `$and` | Logical AND | `{ $and: [cond1, cond2] }` |
| `$or` | Logical OR | `{ $or: [cond1, cond2] }` |
| `$not` | Logical NOT | `{ $not: { status: { $eq: 'deleted' } } }` |

---

## What Happens Under the Hood

```
db.main.orders.findMany({ where: { status: 'active' }, limit: 50 })
  │
  ├─ Client builds structured JSON:
  │   { action: "findMany", table: "main.orders",
  │     where: { status: { "$eq": "active" } }, limit: 50 }
  │
  ├─ HTTP POST to /data with Authorization: Bearer <jwt>
  │
  ├─ Server pipeline:
  │   ├─ JWT → auth.resolveSession() → $user object
  │   ├─ Permission check → injects WHERE clauses (row-level security)
  │   ├─ Column stripping (only permitted columns returned)
  │   ├─ Query builder: JSON → Kysely → SQL
  │   └─ DuckDB executes (session-isolated instance)
  │
  └─ Response: typed JSON array
```

---

## Imports Summary

```typescript
// Data client
import { createClient }       from '@superapp/db'

// Auth
import { createAuth }         from '@superapp/db/auth'

// UI components (re-exports from better-auth-ui)
import { AuthProvider }        from '@superapp/db/components'
import { AuthCard }            from '@superapp/db/components'
import { UserButton }          from '@superapp/db/components'

// Types (for advanced usage)
import type { QueryRequest }   from '@superapp/db/types'
import type { FilterOperators } from '@superapp/db/types'

// Generated schema (project-specific)
import type { SuperAppSchema } from './generated/schema'
```
