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

function DatabaseIcon({ type, className = 'h-5 w-5' }: { type: string; className?: string }) {
  switch (type) {
    case 'PostgreSQL':
      return (
        <svg className={className} viewBox="0 0 25.6 25.6" fill="none">
          <g transform="translate(0 0)">
            <path d="M18.98 20.85c.04-.26.06-.54.07-.84l.03-.04c1.06-1.39 1.72-3.09 2.09-4.93.37-1.8.48-3.76.42-5.58 0-.09-.01-.25-.03-.44.3-.54.5-1.13.64-1.68.24-.95.3-1.89.24-2.67a6.5 6.5 0 0 0-.8-2.63c-1.22-2.15-3.14-4.02-5.43-4.19-1.96-.14-3.74.18-5.24.77-.43-.03-.89-.06-1.39-.06h-.15c-1.75.03-3.36.44-4.71 1.08-.9-.39-2.73-1.05-4.87-.88C2.06 2.06-.2 3.35-1.45 6.12c-1.64 3.62-1.08 9.58.48 14.36.51 1.57 1.11 3.03 1.84 4.29.95 1.64 2.02 2.79 3.32 3.3.59.23 1.25.3 1.94.14.52-.12.98-.37 1.42-.72.11.05.22.1.33.14.77.26 1.55.33 2.33.22.33-.05.66-.13.97-.26v.07c.18 1.06.62 1.9 1.35 2.48.78.61 1.7.77 2.59.72 1.64-.1 3.36-.78 4.44-1.26l.06-.03c1.73-.78 2.91-1.46 3.73-2.65.41-.6.68-1.28.8-2.1Z" fill="#336791"/>
            <path d="M18.09 20.92c-.05.16-.1.39-.11.75-.05 1.39-.23 2.05-.62 2.6-.47.69-1.23 1.26-2.91 2.02-1.73.78-3.13 1.17-4.15 1.02-.49-.07-.86-.31-1.15-.53-.54-.42-.83-1.05-.95-1.75-.16-.92-.05-1.96.06-2.69.08-.5.11-.94.11-1.34 0-.17-.01-.32-.03-.47a1 1 0 0 0-.15-.43c-.17-.29-.45-.43-.73-.51-.29-.09-.62-.14-.85-.11a5.6 5.6 0 0 1-2.16-.19c-.48-.16-.85-.41-1.2-.87-.28.3-.69.56-1.16.67-.37.09-.75.06-1.11-.08-.91-.35-1.78-1.24-2.62-2.69-.68-1.17-1.25-2.56-1.74-4.05C.76 8.93.22 3.28 1.6.25 2.62-1.85 4.46-2.81 6.11-2.93c1.94-.14 3.68.55 4.62.96.19.08.35.15.47.21C12.52-2.44 14.1-2.88 15.78-2.9c.52-.01 1.06.03 1.6.11.14-.07.29-.15.45-.22 1.48-.72 3.41-1.15 5.58-.99 2 .15 3.65 1.82 4.69 3.82.45.87.72 1.73.79 2.56.06.68 0 1.51-.21 2.36a7 7 0 0 1-.39 1.12c.01.21.02.38.02.46.06 1.77-.04 3.68-.4 5.41l-.08.34a.5.5 0 0 1-.04.13c-.37 1.8-1.01 3.37-1.93 4.55Z" transform="translate(1.45 2.93)" fill="#fff"/>
            <path d="M23.49 7.17c-.07-.79-.3-1.53-.69-2.28C21.95 3.23 20.65 1.92 19.23 1.81c-1.78-.13-3.44.22-4.8.85l-.18.09-.18-.08c-.25-.12-.54-.24-.87-.39-.8-.34-2.4-.97-4.1-.85-1.27.09-2.72.81-3.56 2.55-1.27 2.96-.7 8.42.8 13.05.47 1.44 1.02 2.76 1.66 3.85.72 1.25 1.41 1.91 2.05 2.15.21.08.36.06.49.03.24-.06.45-.2.61-.39l.04-.05.08-.11.14.02c.41.05.84.06 1.28.02a.9.9 0 0 0 .24-.07c-.12.59-.2 1.32-.16 2.09.02.37.01.66-.03.93l-.01.04c-.12.71.01 1.53.09 2.02.11.66.45 1.18 1.01 1.62.55.43 1.28.69 2.06.6 1.05-.11 2.41-.5 3.97-1.21 1.59-.72 2.24-1.2 2.65-1.8.38-.56.57-1.21.62-2.6.01-.37.04-.58.11-.75.84-1.1 1.43-2.59 1.77-4.29.36-1.73.46-3.59.4-5.28 0-.11-.01-.27-.02-.44l-.01-.14.07-.13c.23-.42.41-.9.54-1.49.18-.73.24-1.43.18-2.01Z" fill="#336791"/>
          </g>
          <path d="M12.14 24.1c-.08.06-.09.23-.01.38.07.15.2.23.28.18s.08-.23.01-.38c-.07-.15-.2-.23-.28-.18Z" fill="#fff"/>
          <path d="M20.59 9.11c.03-.42-.02-.92-.14-1.41-.07-.27-.15-.48-.24-.57a.27.27 0 0 0-.1-.06c.1.01.22.1.32.42.13.44.2.96.17 1.4-.06.82-.4 1.34-.66 1.33-.12-.01-.19-.09-.25-.23-.1-.23-.15-.58-.17-.91-.02-.33-.01-.67.04-.97.08-.52.27-1.07.54-1.44.15-.2.35-.31.5-.29l-.01 0a.35.35 0 0 0-.14-.04c-.12 0-.33.08-.47.27-.28.39-.48.95-.57 1.47a4.4 4.4 0 0 0-.04.95c.02.34.08.56.2.69.05.06.12.08.2.09.39.02.76-.63.82-1.45ZM10.37 8.53c-.05.86.2 1.7.6 1.75.08.01.16-.03.23-.09.16-.14.26-.41.31-.58.11-.36.15-.83.12-1.35-.04-.52-.17-1.07-.38-1.44-.12-.2-.27-.35-.41-.37.09-.01.2.06.3.24.2.35.33.89.36 1.39.04.51-.01.96-.12 1.23-.05.13-.11.21-.19.25a.16.16 0 0 1-.09.01c-.29-.04-.54-.77-.49-1.63.02-.28.07-.58.15-.85.07-.25.17-.44.27-.51a.27.27 0 0 0-.18.03c-.13.07-.24.27-.33.54-.09.27-.14.57-.16.86Z" fill="#fff"/>
        </svg>
      )
    case 'MySQL':
      return (
        <svg className={className} viewBox="0 0 128 128">
          <path fill="#00618A" d="M2.001 90.458h4.108V74.235l6.36 13.156c.749 1.603 1.753 2.17 3.622 2.17s2.788-.567 3.537-2.17l6.36-13.156v16.223h4.108V72.386c0-1.603-.483-2.378-1.585-2.693-2.624-.838-4.473.14-5.267 1.918l-6.63 13.785-6.63-13.785c-.75-1.778-2.643-2.756-5.268-1.918-1.1.315-1.584 1.09-1.584 2.693v18.072h-.131zM34.471 90.458h4.108v-8.386l8.044-12.455c.916-1.4.339-3.16-1.724-3.16-1.155 0-1.835.455-2.381 1.33L36.816 77.5l-5.702-9.712c-.546-.876-1.226-1.33-2.382-1.33-2.062 0-2.64 1.76-1.724 3.16l8.044 12.455v8.386h-.581z"/>
          <path fill="#E48E00" d="M62.124 66.457c-7.15 0-11.256 4.95-11.256 12.14 0 7.394 4.107 12.458 11.526 12.458 3.16 0 5.898-.71 8.166-2.48v-3.79c-2.268 1.82-4.655 2.72-7.702 2.72-4.584 0-7.553-2.924-7.883-7.673h16.672c.084-.736.084-1.262.084-1.73-.001-7.394-3.794-11.645-9.607-11.645zm-5.32 10.265c.558-4.226 2.912-6.755 5.862-6.755 3.512 0 5.222 2.723 5.222 6.755H56.804z"/>
          <path fill="#00618A" d="M95.553 67.875c-2.226-1.163-5.222-1.618-8.734-1.618-2.412 0-4.854.254-7.024.806v-1.318c0-4.064 2.082-6.05 6.36-6.05 2.382 0 4.55.567 6.36 1.362v-3.72c-1.84-.71-4.254-1.163-6.63-1.163-7.025 0-10.558 3.637-10.558 9.815v14.5c2.844 1.035 6.46 1.567 10.15 1.567 3.39 0 6.23-.65 8.47-1.918v-2.54c.012 0 .012 0 .012-.042v-7.828c0-1.072-.522-1.638-1.584-2.053h3.178zm-1.594 10.012c-1.81.954-4.107 1.403-6.69 1.403-2.255 0-4.505-.337-6.36-.924V70.6c2.268-.568 4.524-.882 6.84-.882 2.296 0 4.38.337 6.21 1.078v7.091z"/>
          <path fill="#E48E00" d="M105.024 56.162c-1.424 0-2.526 1.093-2.526 2.481s1.102 2.481 2.526 2.481c1.395 0 2.526-1.093 2.526-2.481s-1.131-2.481-2.526-2.481zm2.006 18.066V66.84h-4.108v23.618h4.108V74.228z"/>
          <path fill="#00618A" d="M125.68 90.457h-4.104V56.162h4.104z"/>
          <path fill="#E48E00" d="M116.174 90.458l-6.932-24.34h4.377l5.033 18.69 5.034-18.69h4.076l-6.932 24.34z" transform="translate(-7 0)"/>
        </svg>
      )
    case 'SQLite':
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" fill="#003B57"/>
          <path d="M22 4a2 2 0 0 0-3 0L7.5 15.5c-.3.3-.5.7-.5 1.1v5.8c0 .4.2.8.5 1.1l1 1c.3.3.7.5 1.1.5h5.8c.4 0 .8-.2 1.1-.5L28 13a2 2 0 0 0 0-3L22 4Z" fill="#0F80CC"/>
          <path d="M18 8L8 18c-.2.2-.3.5-.3.8v4.4c0 .3.1.6.3.8l.3.3c.2.2.5.3.8.3h4.4c.3 0 .6-.1.8-.3l10-10L18 8Z" fill="#003B57" fillOpacity="0.3"/>
        </svg>
      )
    case 'Turso':
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none">
          <path d="M16 2L4 8v4l2 1v9l4 4h12l4-4v-9l2-1V8L16 2Z" fill="#4FF8D2"/>
          <path d="M10 13h4v4l-2 2-2-2v-4Z" fill="#0B2727"/>
          <path d="M18 13h4v4l-2 2-2-2v-4Z" fill="#0B2727"/>
          <path d="M14 22h4v3h-4Z" fill="#0B2727"/>
        </svg>
      )
    case 'Neon':
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none">
          <rect x="4" y="6" width="24" height="20" rx="4" fill="#00E599"/>
          <path d="M9 11v10c0 .55.45 1 1 1h2.5c.55 0 1-.45 1-1V14l4.5 8h3c.55 0 1-.45 1-1V11c0-.55-.45-1-1-1h-1.5c-.55 0-1 .45-1 1v7l-4.5-8H10c-.55 0-1 .45-1 1Z" fill="#0A0A0A"/>
        </svg>
      )
    case 'Supabase':
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none">
          <path d="M18.24 28.68c-.68.86-2.06.37-2.08-.73l-.28-14.95h10.06c1.82 0 2.83 2.1 1.69 3.53L18.24 28.68Z" fill="url(#sb_a)"/>
          <path d="M18.24 28.68c-.68.86-2.06.37-2.08-.73l-.28-14.95h10.06c1.82 0 2.83 2.1 1.69 3.53L18.24 28.68Z" fill="url(#sb_b)" fillOpacity=".2"/>
          <path d="M13.88 3.32c.68-.86 2.06-.37 2.08.73l.14 14.95H6.28c-1.82 0-2.83-2.1-1.69-3.53L13.88 3.32Z" fill="#3ECF8E"/>
          <defs>
            <linearGradient id="sb_a" x1="15.88" y1="16.14" x2="24.04" y2="20.53" gradientUnits="userSpaceOnUse">
              <stop stopColor="#249361"/><stop offset="1" stopColor="#3ECF8E"/>
            </linearGradient>
            <linearGradient id="sb_b" x1="11.68" y1="10.87" x2="16.03" y2="21.15" gradientUnits="userSpaceOnUse">
              <stop/><stop offset="1" stopOpacity="0"/>
            </linearGradient>
          </defs>
        </svg>
      )
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3"/>
          <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
          <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
        </svg>
      )
  }
}

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  PostgreSQL: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
  MySQL: { bg: 'bg-sky-500/10', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-500/20' },
  SQLite: { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/20' },
  Turso: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
  Neon: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', border: 'border-green-500/20' },
  Supabase: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
  Unknown: { bg: 'bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-500/20' },
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
  const [editingConn, setEditingConn] = useState<Connection | null>(null)
  const [editName, setEditName] = useState('')
  const [editUrl, setEditUrl] = useState('')

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

  const openEdit = (conn: Connection) => {
    setEditingConn(conn)
    setEditName(conn.name)
    setEditUrl(conn.url)
  }

  const saveEdit = () => {
    if (!editingConn || !editName || !editUrl) return
    const newType = detectType(editUrl)
    setConnections(prev =>
      prev.map(c =>
        c.name === editingConn.name
          ? { ...c, name: editName, url: editUrl, type: newType, status: 'pending' }
          : c
      )
    )
    const savedName = editName
    setEditingConn(null)
    setTimeout(() => {
      setConnections(prev => prev.map(c => c.name === savedName ? { ...c, status: 'connected' } : c))
    }, 1500)
  }

  const detectedAddType = newUrl ? detectType(newUrl) : null
  const detectedEditType = editUrl ? detectType(editUrl) : null
  const colors = (type: string) => typeColors[type] || typeColors.Unknown

  return (
    <>
      <div className="not-prose rounded-xl border border-fd-border bg-fd-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-fd-border px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-fd-primary/10">
              <svg className="h-3.5 w-3.5 text-fd-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
                <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-fd-foreground">Database Connections</span>
            <span className="rounded-full bg-fd-primary/10 px-2 py-0.5 text-xs font-medium text-fd-primary">{connections.length}</span>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-transparent bg-fd-primary px-3 py-1.5 text-xs font-medium text-fd-primary-foreground transition-all hover:bg-fd-primary/90 active:scale-[0.97]"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add Connection
          </button>
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="border-b border-fd-border bg-fd-accent/40 px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-2">
              <div className="flex-shrink-0">
                <label className="mb-1.5 block text-xs font-medium text-fd-foreground">Name</label>
                <input
                  type="text"
                  placeholder="analytics"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="h-8 w-full rounded-lg border border-fd-border bg-fd-background px-2.5 text-sm text-fd-foreground placeholder:text-fd-muted-foreground outline-none transition-colors focus-visible:border-fd-ring focus-visible:ring-3 focus-visible:ring-fd-ring/50 sm:w-36"
                />
              </div>
              <div className="min-w-0 flex-1">
                <label className="mb-1.5 block text-xs font-medium text-fd-foreground">Connection URL</label>
                <input
                  type="text"
                  placeholder="postgres://user:pass@host:5432/db"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  className="h-8 w-full rounded-lg border border-fd-border bg-fd-background px-2.5 text-sm text-fd-foreground placeholder:text-fd-muted-foreground outline-none transition-colors focus-visible:border-fd-ring focus-visible:ring-3 focus-visible:ring-fd-ring/50"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addConnection}
                  disabled={!newName || !newUrl}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-fd-primary px-3 text-xs font-medium text-fd-primary-foreground transition-all hover:bg-fd-primary/90 disabled:pointer-events-none disabled:opacity-50"
                >
                  Connect
                </button>
                <button
                  onClick={() => { setShowAdd(false); setNewName(''); setNewUrl('') }}
                  className="inline-flex h-8 items-center rounded-lg border border-fd-border bg-fd-background px-3 text-xs font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
            {detectedAddType && (
              <div className="mt-2.5 flex items-center gap-2 text-xs text-fd-muted-foreground">
                <span>Detected:</span>
                <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-medium ${colors(detectedAddType).bg} ${colors(detectedAddType).text} ${colors(detectedAddType).border}`}>
                  <DatabaseIcon type={detectedAddType} className="h-3.5 w-3.5" />
                  {detectedAddType}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Connection list */}
        <div className="divide-y divide-fd-border">
          {connections.map(conn => {
            const c = colors(conn.type)
            return (
              <div key={conn.name} className="group flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-fd-accent/30">
                <div className="flex items-center gap-3.5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${c.bg} ${c.border}`}>
                    <DatabaseIcon type={conn.type} className="h-5 w-5" />
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
                    onClick={() => openEdit(conn)}
                    className="rounded-md p-1.5 text-fd-muted-foreground opacity-0 transition-all hover:bg-fd-accent hover:text-fd-foreground group-hover:opacity-100"
                    title="Edit connection"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                      <path d="m15 5 4 4"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => removeConnection(conn.name)}
                    className="rounded-md p-1.5 text-fd-muted-foreground opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                    title="Remove connection"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
          {connections.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
              <svg className="h-8 w-8 text-fd-muted-foreground/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
                <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
              </svg>
              <p className="text-sm text-fd-muted-foreground">No connections configured.</p>
              <button
                onClick={() => setShowAdd(true)}
                className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-fd-primary px-3 py-1.5 text-xs font-medium text-fd-primary-foreground transition-all hover:bg-fd-primary/90"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Add your first connection
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingConn && (
        <div className="not-prose fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingConn(null)} />
          <div className="relative w-full max-w-md rounded-xl border border-fd-border bg-fd-card p-6 shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setEditingConn(null)}
              className="absolute right-4 top-4 rounded-md p-1 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>

            <div className="mb-5 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${colors(editingConn.type).bg} ${colors(editingConn.type).border}`}>
                <DatabaseIcon type={editingConn.type} className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-fd-foreground">Edit Connection</h3>
                <p className="text-xs text-fd-muted-foreground">Modify connection name or URL</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-fd-foreground">Connection Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="h-9 w-full rounded-lg border border-fd-border bg-fd-background px-3 text-sm text-fd-foreground placeholder:text-fd-muted-foreground outline-none transition-colors focus-visible:border-fd-ring focus-visible:ring-3 focus-visible:ring-fd-ring/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-fd-foreground">Connection URL</label>
                <input
                  type="text"
                  value={editUrl}
                  onChange={e => setEditUrl(e.target.value)}
                  className="h-9 w-full rounded-lg border border-fd-border bg-fd-background px-3 text-sm font-mono text-fd-foreground placeholder:text-fd-muted-foreground outline-none transition-colors focus-visible:border-fd-ring focus-visible:ring-3 focus-visible:ring-fd-ring/50"
                />
              </div>
              {detectedEditType && (
                <div className="flex items-center gap-2 text-xs text-fd-muted-foreground">
                  <span>Type:</span>
                  <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-medium ${colors(detectedEditType).bg} ${colors(detectedEditType).text} ${colors(detectedEditType).border}`}>
                    <DatabaseIcon type={detectedEditType} className="h-3.5 w-3.5" />
                    {detectedEditType}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingConn(null)}
                className="inline-flex h-8 items-center rounded-lg border border-fd-border bg-fd-background px-3 text-xs font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={!editName || !editUrl}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-fd-primary px-3 text-xs font-medium text-fd-primary-foreground transition-all hover:bg-fd-primary/90 disabled:pointer-events-none disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
