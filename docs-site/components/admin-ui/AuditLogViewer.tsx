'use client'

import { useState, useEffect, useCallback } from 'react'

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

function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }) + ' at ' + d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function formatTime(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-wide text-fd-muted-foreground font-medium">{label}</span>
      <span className="text-sm text-fd-foreground">{children}</span>
    </div>
  )
}

export function AuditLogViewer() {
  const [filter, setFilter] = useState<'all' | 'select' | 'insert' | 'update' | 'delete'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all')
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null)
  const [searchUser, setSearchUser] = useState('')

  const closeModal = useCallback(() => setSelectedEntry(null), [])

  useEffect(() => {
    if (!selectedEntry) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [selectedEntry, closeModal])

  const filtered = mockEntries.filter(e => {
    if (filter !== 'all' && e.operation !== filter) return false
    if (statusFilter !== 'all' && e.status !== statusFilter) return false
    if (searchUser && !e.userName.toLowerCase().includes(searchUser.toLowerCase())) return false
    return true
  })

  return (
    <>
      {/* List card */}
      <div className="not-prose rounded-xl border border-fd-border overflow-hidden">
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
              className="h-8 w-40 rounded-lg border border-fd-border bg-transparent px-2.5 py-1 text-sm outline-none transition-colors placeholder:text-fd-muted-foreground focus-visible:border-fd-ring focus-visible:ring-3 focus-visible:ring-fd-ring/50"
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
              className="h-8 rounded-lg border border-fd-border bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-fd-ring focus-visible:ring-3 focus-visible:ring-fd-ring/50"
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
              className={`inline-flex items-center justify-center rounded-lg px-2.5 text-sm font-medium transition-colors h-8 capitalize ${
                filter === op
                  ? 'bg-fd-primary text-fd-primary-foreground'
                  : 'text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground'
              }`}
            >
              {op}
            </button>
          ))}
        </div>

        {/* Log entries */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-fd-border scrollbar-thin scrollbar-thumb-fd-border scrollbar-track-transparent hover:scrollbar-thumb-fd-muted-foreground/30 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-fd-border hover:[&::-webkit-scrollbar-thumb]:bg-fd-muted-foreground/30">
          {filtered.map(entry => (
            <button
              key={entry.id}
              onClick={() => setSelectedEntry(entry)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-fd-accent/50 transition-colors cursor-pointer"
            >
              <span className="text-xs font-mono text-fd-muted-foreground w-16 shrink-0">{formatTime(entry.timestamp)}</span>
              <span className={`rounded px-1.5 py-0.5 text-xs font-medium uppercase w-14 text-center shrink-0 ${opColors[entry.operation]}`}>
                {entry.operation}
              </span>
              <span className="text-xs font-mono text-fd-foreground truncate w-28 shrink-0">{entry.table}</span>
              <span className="text-xs text-fd-muted-foreground truncate flex-1">{entry.userName}</span>
              <span className="text-xs font-mono text-fd-muted-foreground w-12 text-right shrink-0">{entry.durationMs}ms</span>
              <span className={`h-2 w-2 rounded-full shrink-0 ${entry.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-fd-muted-foreground">
              No audit entries match the current filters.
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selectedEntry && (
        <div className="not-prose fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-lg mx-4 rounded-xl border border-fd-border bg-fd-card p-6 shadow-2xl">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-md p-1 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>

            {/* Header */}
            <div className="mb-5 flex items-center gap-3">
              <span className={`rounded px-2 py-0.5 text-xs font-semibold uppercase ${opColors[selectedEntry.operation]}`}>
                {selectedEntry.operation}
              </span>
              <div>
                <h3 className="text-base font-semibold text-fd-foreground">{selectedEntry.table}</h3>
                <p className="text-xs text-fd-muted-foreground">{formatTimestamp(selectedEntry.timestamp)}</p>
              </div>
              <span className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                selectedEntry.status === 'success'
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${selectedEntry.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                {selectedEntry.status}
              </span>
            </div>

            {/* Detail grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border border-fd-border bg-fd-accent/30 p-4">
              <DetailRow label="Duration">
                <span className="font-mono text-xs">{selectedEntry.durationMs}ms</span>
              </DetailRow>
              <DetailRow label="Role">
                <span className="font-mono text-xs">{selectedEntry.role}</span>
              </DetailRow>
              <DetailRow label="User">
                <span className="font-mono text-xs">{selectedEntry.userName}</span>
              </DetailRow>
              <DetailRow label="User ID">
                <span className="font-mono text-xs">{selectedEntry.userId}</span>
              </DetailRow>
              <DetailRow label="IP Address">
                <span className="font-mono text-xs">{selectedEntry.ip}</span>
              </DetailRow>
            </div>

            {/* SQL query */}
            <div className="mt-4">
              <span className="text-[11px] uppercase tracking-wide text-fd-muted-foreground font-medium">SQL Query</span>
              {selectedEntry.query ? (
                <pre className="mt-1.5 rounded-lg border border-fd-border bg-fd-background p-3 text-xs font-mono text-fd-foreground overflow-x-auto leading-relaxed">{selectedEntry.query}</pre>
              ) : (
                <p className="mt-1.5 text-xs text-fd-muted-foreground italic">Query logging disabled or query not captured</p>
              )}
            </div>

            {/* Footer */}
            <div className="mt-5 flex justify-end">
              <button
                onClick={closeModal}
                className="inline-flex h-8 items-center rounded-lg border border-fd-border bg-fd-background px-3 text-xs font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
