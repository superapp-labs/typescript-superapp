'use client'

import { useState } from 'react'

interface AuditEntry {
  id: string
  timestamp: string
  userId: string
  userName: string
  table: string
  operation: 'select' | 'insert' | 'update' | 'delete'
  role: string
  durationMs: number
  status: 'success' | 'error'
  ip: string
  query?: string
}

const mockEntries: AuditEntry[] = [
  { id: '1', timestamp: '2026-02-17T14:32:01Z', userId: 'usr_a1', userName: 'alice@acme.com', table: 'main.orders', operation: 'select', role: 'admin', durationMs: 12, status: 'success', ip: '192.168.1.10', query: 'SELECT id, customer_id, total, status FROM orders WHERE status != $1 LIMIT 100' },
  { id: '2', timestamp: '2026-02-17T14:31:55Z', userId: 'usr_b2', userName: 'bob@acme.com', table: 'main.orders', operation: 'update', role: 'manager', durationMs: 8, status: 'success', ip: '192.168.1.11', query: "UPDATE orders SET status = $1, updated_at = $2 WHERE id = $3 AND status != 'completed'" },
  { id: '3', timestamp: '2026-02-17T14:31:42Z', userId: 'usr_c3', userName: 'carol@acme.com', table: 'main.products', operation: 'insert', role: 'editor', durationMs: 5, status: 'success', ip: '192.168.1.12', query: 'INSERT INTO products (name, price, status) VALUES ($1, $2, $3)' },
  { id: '4', timestamp: '2026-02-17T14:31:30Z', userId: 'usr_b2', userName: 'bob@acme.com', table: 'main.orders', operation: 'delete', role: 'manager', durationMs: 3, status: 'error', ip: '192.168.1.11', query: "DELETE FROM orders WHERE id = $1 AND status = 'draft'" },
  { id: '5', timestamp: '2026-02-17T14:31:18Z', userId: 'usr_a1', userName: 'alice@acme.com', table: 'main.users', operation: 'select', role: 'admin', durationMs: 45, status: 'success', ip: '192.168.1.10', query: 'SELECT id, email, name, role FROM users WHERE organization_id = $1' },
  { id: '6', timestamp: '2026-02-17T14:31:02Z', userId: 'usr_d4', userName: 'dave@acme.com', table: 'main.products', operation: 'update', role: 'editor', durationMs: 6, status: 'success', ip: '10.0.0.5', query: 'UPDATE products SET price = $1 WHERE id = $2' },
  { id: '7', timestamp: '2026-02-17T14:30:48Z', userId: 'usr_a1', userName: 'alice@acme.com', table: 'main.orders', operation: 'select', role: 'admin', durationMs: 128, status: 'success', ip: '192.168.1.10', query: 'SELECT o.*, p.name FROM orders o JOIN products p ON o.product_id = p.id WHERE o.created_at > $1' },
  { id: '8', timestamp: '2026-02-17T14:30:33Z', userId: 'usr_c3', userName: 'carol@acme.com', table: 'main.orders', operation: 'insert', role: 'editor', durationMs: 4, status: 'error', ip: '192.168.1.12' },
]

const opColors = {
  select: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  insert: 'bg-green-500/10 text-green-600 dark:text-green-400',
  update: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  delete: 'bg-red-500/10 text-red-600 dark:text-red-400',
}

export function AuditLogViewer() {
  const [filter, setFilter] = useState<'all' | 'select' | 'insert' | 'update' | 'delete'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchUser, setSearchUser] = useState('')

  const filtered = mockEntries.filter(e => {
    if (filter !== 'all' && e.operation !== filter) return false
    if (statusFilter !== 'all' && e.status !== statusFilter) return false
    if (searchUser && !e.userName.toLowerCase().includes(searchUser.toLowerCase())) return false
    return true
  })

  const formatTime = (ts: string) => {
    const d = new Date(ts)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  }

  return (
    <div className="not-prose rounded-xl border border-fd-border bg-fd-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-fd-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-fd-foreground">Audit Log</span>
          <span className="rounded-full bg-fd-accent px-2 py-0.5 text-xs text-fd-muted-foreground">{filtered.length} entries</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Filter by user..."
            value={searchUser}
            onChange={e => setSearchUser(e.target.value)}
            className="w-40 rounded-lg border border-fd-border bg-fd-background px-2.5 py-1 text-xs text-fd-foreground placeholder:text-fd-muted-foreground focus:outline-none focus:ring-2 focus:ring-fd-primary"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-lg border border-fd-border bg-fd-background px-2 py-1 text-xs text-fd-foreground focus:outline-none focus:ring-2 focus:ring-fd-primary"
          >
            <option value="all">All status</option>
            <option value="success">Success</option>
            <option value="error">Errors</option>
          </select>
        </div>
      </div>

      {/* Operation filter tabs */}
      <div className="flex gap-1 border-b border-fd-border px-4 py-2">
        {(['all', 'select', 'insert', 'update', 'delete'] as const).map(op => (
          <button
            key={op}
            onClick={() => setFilter(op)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
              filter === op
                ? 'bg-fd-primary text-fd-primary-foreground'
                : 'text-fd-muted-foreground hover:bg-fd-accent'
            }`}
          >
            {op}
          </button>
        ))}
      </div>

      {/* Log entries */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-fd-border">
        {filtered.map(entry => (
          <div key={entry.id}>
            <button
              onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-fd-accent/30"
            >
              <span className="text-[11px] font-mono text-fd-muted-foreground w-16 shrink-0">{formatTime(entry.timestamp)}</span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase w-14 text-center shrink-0 ${opColors[entry.operation]}`}>
                {entry.operation}
              </span>
              <span className="text-xs font-mono text-fd-foreground truncate w-28 shrink-0">{entry.table}</span>
              <span className="text-xs text-fd-muted-foreground truncate flex-1">{entry.userName}</span>
              <span className="text-[11px] font-mono text-fd-muted-foreground w-12 text-right shrink-0">{entry.durationMs}ms</span>
              <span className={`h-2 w-2 rounded-full shrink-0 ${entry.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={`shrink-0 text-fd-muted-foreground transition-transform ${expandedId === entry.id ? 'rotate-90' : ''}`}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            {expandedId === entry.id && (
              <div className="border-t border-fd-border bg-fd-accent/20 px-4 py-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-fd-muted-foreground">User ID: </span>
                    <span className="font-mono text-fd-foreground">{entry.userId}</span>
                  </div>
                  <div>
                    <span className="text-fd-muted-foreground">Role: </span>
                    <span className="font-medium text-fd-foreground">{entry.role}</span>
                  </div>
                  <div>
                    <span className="text-fd-muted-foreground">IP: </span>
                    <span className="font-mono text-fd-foreground">{entry.ip}</span>
                  </div>
                  <div>
                    <span className="text-fd-muted-foreground">Status: </span>
                    <span className={entry.status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{entry.status}</span>
                  </div>
                </div>
                {entry.query && (
                  <div className="mt-2">
                    <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wide">Query</span>
                    <pre className="mt-1 rounded-lg bg-fd-background p-2 text-[11px] font-mono text-fd-foreground overflow-x-auto">{entry.query}</pre>
                  </div>
                )}
                {!entry.query && (
                  <div className="mt-2 text-[11px] text-fd-muted-foreground italic">Query logging disabled or query not captured</div>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-fd-muted-foreground">
            No audit entries match the current filters.
          </div>
        )}
      </div>
    </div>
  )
}
