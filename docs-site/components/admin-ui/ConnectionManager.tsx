'use client'

import { useState } from 'react'

interface Connection {
  name: string
  url: string
  type: string
  status: 'connected' | 'error' | 'pending'
}

function detectType(url: string): string {
  if (url.startsWith('postgres://') || url.startsWith('postgresql://')) return 'PostgreSQL'
  if (url.startsWith('mysql://')) return 'MySQL'
  if (url.endsWith('.db') || url.endsWith('.sqlite')) return 'SQLite'
  if (url.startsWith('libsql://')) return 'Turso'
  if (url.includes('neon.tech')) return 'Neon'
  if (url.includes('supabase')) return 'Supabase'
  return 'Unknown'
}

function typeIcon(type: string): string {
  switch (type) {
    case 'PostgreSQL': return '🐘'
    case 'MySQL': return '🐬'
    case 'SQLite': return '📦'
    case 'Turso': return '🚀'
    case 'Neon': return '⚡'
    case 'Supabase': return '💚'
    default: return '🔗'
  }
}

const initialConnections: Connection[] = [
  { name: 'main', url: 'postgres://localhost:5432/mydb', type: 'PostgreSQL', status: 'connected' },
  { name: 'warehouse', url: 'mysql://user:***@host:3306/warehouse', type: 'MySQL', status: 'connected' },
]

export function ConnectionManager() {
  const [connections, setConnections] = useState<Connection[]>(initialConnections)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const addConnection = () => {
    if (!newName || !newUrl) return
    const type = detectType(newUrl)
    setConnections([...connections, { name: newName, url: newUrl, type, status: 'pending' }])
    setNewName('')
    setNewUrl('')
    setShowAdd(false)
    setTimeout(() => {
      setConnections(prev => prev.map(c => c.name === newName ? { ...c, status: 'connected' } : c))
    }, 1500)
  }

  const removeConnection = (name: string) => {
    setConnections(connections.filter(c => c.name !== name))
  }

  return (
    <div className="not-prose rounded-xl border border-fd-border bg-fd-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-fd-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium text-fd-foreground">Database Connections</span>
          <span className="rounded-full bg-fd-accent px-2 py-0.5 text-xs text-fd-muted-foreground">{connections.length}</span>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="rounded-md bg-fd-primary px-3 py-1.5 text-xs font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/80"
        >
          + Add Connection
        </button>
      </div>

      {showAdd && (
        <div className="border-b border-fd-border bg-fd-accent/50 px-4 py-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Name (e.g. analytics)"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-36 rounded-md border border-fd-border bg-fd-background px-3 py-1.5 text-sm text-fd-foreground placeholder:text-fd-muted-foreground focus:outline-none focus:ring-2 focus:ring-fd-ring"
            />
            <input
              type="text"
              placeholder="postgres://user:pass@host:5432/db"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              className="min-w-0 flex-1 rounded-md border border-fd-border bg-fd-background px-3 py-1.5 text-sm text-fd-foreground placeholder:text-fd-muted-foreground focus:outline-none focus:ring-2 focus:ring-fd-ring"
            />
            <button
              onClick={addConnection}
              className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
            >
              Connect
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="rounded-md border border-fd-border px-3 py-1.5 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent"
            >
              Cancel
            </button>
          </div>
          {newUrl && (
            <div className="mt-2 text-xs text-fd-muted-foreground">
              Detected: <span className="font-medium text-fd-foreground">{typeIcon(detectType(newUrl))} {detectType(newUrl)}</span>
            </div>
          )}
        </div>
      )}

      <div className="divide-y divide-fd-border">
        {connections.map(conn => (
          <div key={conn.name} className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-fd-accent/30">
            <div className="flex items-center gap-3">
              <span className="text-lg">{typeIcon(conn.type)}</span>
              <div>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-semibold text-fd-foreground">{conn.name}</code>
                  <span className="rounded bg-fd-accent px-1.5 py-0.5 text-xs font-medium text-fd-muted-foreground">{conn.type}</span>
                </div>
                <div className="mt-0.5 text-xs font-mono text-fd-muted-foreground">{conn.url}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                conn.status === 'connected' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                conn.status === 'error' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  conn.status === 'connected' ? 'bg-green-500' :
                  conn.status === 'error' ? 'bg-red-500' :
                  'bg-yellow-500 animate-pulse'
                }`} />
                {conn.status}
              </span>
              <button
                onClick={() => removeConnection(conn.name)}
                className="rounded p-1 text-fd-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                title="Remove connection"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        ))}
        {connections.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-fd-muted-foreground">
            No connections configured. Click &quot;Add Connection&quot; to get started.
          </div>
        )}
      </div>
    </div>
  )
}
