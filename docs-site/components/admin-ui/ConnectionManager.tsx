'use client'

import { useState } from 'react'
import { Database, Plus, Pencil, Trash2, X } from 'lucide-react'

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

const typeColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  PostgreSQL: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20', icon: 'text-blue-500' },
  MySQL: { bg: 'bg-sky-500/10', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-500/20', icon: 'text-sky-500' },
  SQLite: { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/20', icon: 'text-slate-500' },
  Turso: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20', icon: 'text-emerald-500' },
  Neon: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', border: 'border-green-500/20', icon: 'text-green-500' },
  Supabase: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20', icon: 'text-emerald-500' },
  Unknown: { bg: 'bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-500/20', icon: 'text-gray-500' },
}

const initialConnections: Connection[] = [
  { name: 'main', url: 'postgres://localhost:5432/mydb', type: 'PostgreSQL', status: 'connected' },
  { name: 'warehouse', url: 'mysql://user:***@host:3306/warehouse', type: 'MySQL', status: 'connected' },
]

export function ConnectionManager() {
  const [connections, setConnections] = useState<Connection[]>(initialConnections)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editingConn, setEditingConn] = useState<Connection | null>(null)
  const [formName, setFormName] = useState('')
  const [formUrl, setFormUrl] = useState('')

  const openAdd = () => {
    setModal('add')
    setEditingConn(null)
    setFormName('')
    setFormUrl('')
  }

  const openEdit = (conn: Connection) => {
    setModal('edit')
    setEditingConn(conn)
    setFormName(conn.name)
    setFormUrl(conn.url)
  }

  const closeModal = () => {
    setModal(null)
    setEditingConn(null)
    setFormName('')
    setFormUrl('')
  }

  const handleSave = () => {
    if (!formName || !formUrl) return
    const type = detectType(formUrl)

    if (modal === 'add') {
      setConnections(prev => [...prev, { name: formName, url: formUrl, type, status: 'pending' }])
      const savedName = formName
      closeModal()
      setTimeout(() => {
        setConnections(prev => prev.map(c => c.name === savedName ? { ...c, status: 'connected' } : c))
      }, 1500)
    } else if (modal === 'edit' && editingConn) {
      setConnections(prev =>
        prev.map(c =>
          c.name === editingConn.name
            ? { ...c, name: formName, url: formUrl, type, status: 'pending' }
            : c
        )
      )
      const savedName = formName
      closeModal()
      setTimeout(() => {
        setConnections(prev => prev.map(c => c.name === savedName ? { ...c, status: 'connected' } : c))
      }, 1500)
    }
  }

  const removeConnection = (e: React.MouseEvent, name: string) => {
    e.stopPropagation()
    setConnections(connections.filter(c => c.name !== name))
  }

  const detectedType = formUrl ? detectType(formUrl) : null
  const colors = (type: string) => typeColors[type] || typeColors.Unknown

  return (
    <>
      <div className="not-prose rounded-xl border border-fd-border bg-fd-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-fd-border px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-fd-primary/10">
              <Database className="h-3.5 w-3.5 text-fd-primary" />
            </div>
            <span className="text-sm font-semibold text-fd-foreground">Database Connections</span>
            <span className="rounded-full bg-fd-primary/10 px-2 py-0.5 text-xs font-medium text-fd-primary">{connections.length}</span>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 rounded-lg border border-transparent bg-fd-primary px-3 py-1.5 text-xs font-medium text-fd-primary-foreground transition-all hover:bg-fd-primary/90 active:scale-[0.97]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Connection
          </button>
        </div>

        {/* Connection list */}
        <div className="divide-y divide-fd-border">
          {connections.map(conn => {
            const c = colors(conn.type)
            return (
              <div
                key={conn.name}
                onClick={() => openEdit(conn)}
                className="group flex cursor-pointer items-center justify-between px-5 py-3.5 transition-colors hover:bg-fd-accent/30"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${c.bg} ${c.border}`}>
                    <Database className={`h-4.5 w-4.5 ${c.icon}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-semibold text-fd-foreground">{conn.name}</code>
                      <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${c.bg} ${c.text} ${c.border}`}>
                        {conn.type}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs font-mono text-fd-muted-foreground">{conn.url}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
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
                    onClick={(e) => { e.stopPropagation(); openEdit(conn) }}
                    className="rounded-md p-1.5 text-fd-muted-foreground opacity-0 transition-all hover:bg-fd-accent hover:text-fd-foreground group-hover:opacity-100"
                    title="Edit connection"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => removeConnection(e, conn.name)}
                    className="rounded-md p-1.5 text-fd-muted-foreground opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                    title="Remove connection"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
          {connections.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
              <Database className="h-8 w-8 text-fd-muted-foreground/40" />
              <p className="text-sm text-fd-muted-foreground">No connections configured.</p>
              <button
                onClick={openAdd}
                className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-fd-primary px-3 py-1.5 text-xs font-medium text-fd-primary-foreground transition-all hover:bg-fd-primary/90"
              >
                <Plus className="h-3.5 w-3.5" />
                Add your first connection
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <div className="not-prose fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-md rounded-xl border border-fd-border bg-fd-card p-6 shadow-2xl">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-md p-1 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-5 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
                modal === 'edit' && editingConn
                  ? `${colors(editingConn.type).bg} ${colors(editingConn.type).border}`
                  : 'bg-fd-primary/10 border-fd-primary/20'
              }`}>
                <Database className={`h-5 w-5 ${
                  modal === 'edit' && editingConn
                    ? colors(editingConn.type).icon
                    : 'text-fd-primary'
                }`} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-fd-foreground">
                  {modal === 'add' ? 'New Connection' : 'Edit Connection'}
                </h3>
                <p className="text-xs text-fd-muted-foreground">
                  {modal === 'add' ? 'Add a new database connection' : 'Modify connection name or URL'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-fd-foreground">Connection Name</label>
                <input
                  type="text"
                  placeholder="e.g. analytics"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="h-9 w-full rounded-lg border border-fd-border bg-fd-background px-3 text-sm text-fd-foreground placeholder:text-fd-muted-foreground outline-none transition-colors focus-visible:border-fd-ring focus-visible:ring-3 focus-visible:ring-fd-ring/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-fd-foreground">Connection URL</label>
                <input
                  type="text"
                  placeholder="postgres://user:pass@host:5432/db"
                  value={formUrl}
                  onChange={e => setFormUrl(e.target.value)}
                  className="h-9 w-full rounded-lg border border-fd-border bg-fd-background px-3 text-sm font-mono text-fd-foreground placeholder:text-fd-muted-foreground outline-none transition-colors focus-visible:border-fd-ring focus-visible:ring-3 focus-visible:ring-fd-ring/50"
                />
              </div>
              {detectedType && (
                <div className="flex items-center gap-2 text-xs text-fd-muted-foreground">
                  <span>Detected type:</span>
                  <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-medium ${colors(detectedType).bg} ${colors(detectedType).text} ${colors(detectedType).border}`}>
                    <Database className={`h-3 w-3 ${colors(detectedType).icon}`} />
                    {detectedType}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={closeModal}
                className="inline-flex h-8 items-center rounded-lg border border-fd-border bg-fd-background px-3 text-xs font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formName || !formUrl}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-fd-primary px-3 text-xs font-medium text-fd-primary-foreground transition-all hover:bg-fd-primary/90 disabled:pointer-events-none disabled:opacity-50"
              >
                {modal === 'add' ? 'Connect' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
