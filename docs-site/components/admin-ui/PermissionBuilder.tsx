'use client'

import { useState, useEffect } from 'react'

interface WhereClause {
  column: string
  operator: string
  value: string
}

interface Permission {
  name: string
  table: string
  roles: string[]
  operations: {
    select?: { where: WhereClause[]; columns: string[]; limit: number }
    insert?: { columns: string[]; validate: WhereClause[]; defaults: { key: string; value: string }[] }
    update?: { columns: string[]; where: WhereClause[]; validate: WhereClause[]; overwrite: { key: string; value: string }[] }
    delete?: { where: WhereClause[] }
  }
}

const allRoles = ['admin', 'manager', 'editor', 'viewer', 'customer', 'warehouse_manager', 'analyst', 'owner']
const sampleColumns = ['id', 'customer_id', 'total', 'status', 'created_at', 'updated_at', 'notes', 'email', 'name', 'organization_id', 'price', 'stock']
const operators = ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte', '$in', '$nin']
const operationLabels = { select: 'Read', insert: 'Create', update: 'Update', delete: 'Delete' } as const
const operationColors: Record<string, string> = {
  select: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  insert: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  update: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  delete: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
}

const initialPermissions: Permission[] = [
  {
    name: 'read_orders',
    table: 'main.orders',
    roles: ['admin', 'manager'],
    operations: {
      select: {
        where: [{ column: 'status', operator: '$ne', value: 'deleted' }],
        columns: ['id', 'customer_id', 'total', 'status', 'created_at'],
        limit: 100,
      },
    },
  },
  {
    name: 'manage_orders',
    table: 'main.orders',
    roles: ['admin'],
    operations: {
      insert: {
        columns: ['customer_id', 'total', 'status'],
        validate: [{ column: 'total', operator: '$gt', value: '0' }],
        defaults: [{ key: 'status', value: 'pending' }],
      },
      update: {
        columns: ['status', 'total'],
        where: [{ column: 'status', operator: '$ne', value: 'completed' }],
        validate: [{ column: 'total', operator: '$gt', value: '0' }],
        overwrite: [{ key: 'updated_at', value: '$now' }],
      },
      delete: {
        where: [{ column: 'status', operator: '$eq', value: 'draft' }],
      },
    },
  },
]

// --- small sub-components ---

function XButton({ onClick, title }: { onClick: () => void; title?: string }) {
  return (
    <button onClick={onClick} title={title} className="rounded-lg p-0.5 text-fd-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
  )
}

function InlineWhereEditor({ clauses, onChange }: { clauses: WhereClause[]; onChange: (c: WhereClause[]) => void }) {
  return (
    <div className="space-y-1">
      {clauses.map((c, i) => (
        <div key={i} className="flex items-center gap-1">
          <select value={c.column} onChange={e => { const n = [...clauses]; n[i] = { ...c, column: e.target.value }; onChange(n) }}
            className="w-28 rounded-lg border border-fd-border bg-fd-background px-2 py-1 text-xs font-mono outline-none transition-colors focus-visible:border-fd-ring focus-visible:ring-3 focus-visible:ring-fd-ring/50">
            {sampleColumns.map(col => <option key={col} value={col}>{col}</option>)}
          </select>
          <select value={c.operator} onChange={e => { const n = [...clauses]; n[i] = { ...c, operator: e.target.value }; onChange(n) }}
            className="w-16 rounded-lg border border-fd-border bg-fd-background px-2 py-1 text-xs font-mono text-purple-600 dark:text-purple-400 outline-none transition-colors focus-visible:border-fd-ring focus-visible:ring-3 focus-visible:ring-fd-ring/50">
            {operators.map(op => <option key={op} value={op}>{op}</option>)}
          </select>
          <input value={c.value} onChange={e => { const n = [...clauses]; n[i] = { ...c, value: e.target.value }; onChange(n) }}
            className="w-24 rounded-lg border border-fd-border bg-fd-background px-2 py-1 text-xs font-mono outline-none transition-colors focus-visible:border-fd-ring focus-visible:ring-3 focus-visible:ring-fd-ring/50" />
          <XButton onClick={() => onChange(clauses.filter((_, j) => j !== i))} />
        </div>
      ))}
      <button onClick={() => onChange([...clauses, { column: 'id', operator: '$eq', value: '' }])}
        className="text-xs text-fd-primary hover:underline">+ Add condition</button>
    </div>
  )
}

function KVEditor({ items, onChange, keyLabel, valueLabel }: { items: { key: string; value: string }[]; onChange: (v: { key: string; value: string }[]) => void; keyLabel: string; valueLabel: string }) {
  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <input value={item.key} placeholder={keyLabel} onChange={e => { const n = [...items]; n[i] = { ...item, key: e.target.value }; onChange(n) }}
            className="w-28 rounded-lg border border-fd-border bg-fd-background px-2 py-1 text-xs font-mono outline-none transition-colors placeholder:text-fd-muted-foreground focus-visible:border-fd-ring focus-visible:ring-3 focus-visible:ring-fd-ring/50" />
          <span className="text-xs text-fd-muted-foreground">=</span>
          <input value={item.value} placeholder={valueLabel} onChange={e => { const n = [...items]; n[i] = { ...item, value: e.target.value }; onChange(n) }}
            className="w-28 rounded-lg border border-fd-border bg-fd-background px-2 py-1 text-xs font-mono outline-none transition-colors placeholder:text-fd-muted-foreground focus-visible:border-fd-ring focus-visible:ring-3 focus-visible:ring-fd-ring/50" />
          <XButton onClick={() => onChange(items.filter((_, j) => j !== i))} />
        </div>
      ))}
      <button onClick={() => onChange([...items, { key: '', value: '' }])}
        className="text-xs text-fd-primary hover:underline">+ Add</button>
    </div>
  )
}

function ColumnEditor({ columns, onChange }: { columns: string[]; onChange: (c: string[]) => void }) {
  const [adding, setAdding] = useState(false)
  const available = sampleColumns.filter(c => !columns.includes(c))
  return (
    <div className="flex flex-wrap items-center gap-1">
      {columns.map(col => (
        <span key={col} className="inline-flex items-center gap-1 rounded-lg bg-fd-accent px-2 py-0.5 text-xs font-mono text-fd-foreground">
          {col}
          <button onClick={() => onChange(columns.filter(c => c !== col))} className="rounded-lg p-0.5 text-fd-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </span>
      ))}
      {adding ? (
        <select
          autoFocus
          onChange={e => { if (e.target.value) { onChange([...columns, e.target.value]); setAdding(false) } }}
          onBlur={() => setAdding(false)}
          className="rounded-lg border border-fd-border bg-fd-background px-2 py-1 text-xs font-mono outline-none transition-colors focus-visible:border-fd-ring focus-visible:ring-3 focus-visible:ring-fd-ring/50"
        >
          <option value="">select...</option>
          {available.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      ) : (
        <button onClick={() => setAdding(true)} className="rounded-lg border border-dashed border-fd-border px-2 py-0.5 text-xs text-fd-muted-foreground hover:border-fd-primary hover:text-fd-primary">+</button>
      )}
    </div>
  )
}

// --- main component ---

export function PermissionBuilder() {
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions)
  const [modalPerm, setModalPerm] = useState<string | null>(null)
  const [jsonMode, setJsonMode] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [editingRoles, setEditingRoles] = useState(false)

  const activePerm = permissions.find(p => p.name === modalPerm) ?? null

  // Sync JSON text when switching to JSON mode or when the active permission changes
  useEffect(() => {
    if (jsonMode && activePerm) {
      setJsonText(JSON.stringify(activePerm, null, 2))
      setJsonError(null)
    }
  }, [jsonMode, activePerm?.name]) // eslint-disable-line react-hooks/exhaustive-deps

  const updatePerm = (name: string, fn: (p: Permission) => Permission) => {
    setPermissions(prev => prev.map(p => p.name === name ? fn(p) : p))
  }

  const toggleRole = (permName: string, role: string) => {
    updatePerm(permName, p => ({
      ...p,
      roles: p.roles.includes(role) ? p.roles.filter(r => r !== role) : [...p.roles, role],
    }))
  }

  const toggleOperation = (permName: string, op: keyof typeof operationLabels) => {
    updatePerm(permName, p => {
      const operations = { ...p.operations }
      if (operations[op]) {
        delete operations[op]
      } else {
        if (op === 'select') operations.select = { columns: ['id'], limit: 100, where: [] }
        else if (op === 'insert') operations.insert = { columns: ['id'], validate: [], defaults: [] }
        else if (op === 'update') operations.update = { columns: ['id'], where: [], validate: [], overwrite: [] }
        else operations.delete = { where: [] }
      }
      return { ...p, operations }
    })
  }

  const removePermission = (name: string) => {
    const remaining = permissions.filter(p => p.name !== name)
    setPermissions(remaining)
    if (modalPerm === name) closeModal()
  }

  const addPermission = () => {
    const name = `new_permission_${Date.now().toString(36)}`
    const newPerm: Permission = {
      name,
      table: 'main.table_name',
      roles: ['admin'],
      operations: { select: { columns: ['id'], limit: 100, where: [] } },
    }
    setPermissions([...permissions, newPerm])
    openModal(name)
  }

  const openModal = (name: string) => {
    setModalPerm(name)
    setJsonMode(false)
    setJsonError(null)
    setEditingRoles(false)
  }

  const closeModal = () => {
    setModalPerm(null)
    setJsonMode(false)
    setJsonError(null)
    setEditingRoles(false)
  }

  const applyJsonAndSwitch = () => {
    // Switching from JSON to form: try to parse and apply
    try {
      const parsed = JSON.parse(jsonText) as Permission
      if (!parsed.name || !parsed.table || !parsed.roles || !parsed.operations) {
        setJsonError('JSON must include name, table, roles, and operations fields.')
        return
      }
      const oldName = modalPerm!
      setPermissions(prev => prev.map(p => p.name === oldName ? parsed : p))
      setModalPerm(parsed.name)
      setJsonMode(false)
      setJsonError(null)
    } catch {
      setJsonError('Invalid JSON. Fix the syntax and try again.')
    }
  }

  const handleToggleJsonMode = () => {
    if (jsonMode) {
      // Switching from JSON -> Form
      applyJsonAndSwitch()
    } else {
      // Switching from Form -> JSON
      setJsonMode(true)
    }
  }

  return (
    <>
      {/* List card */}
      <div className="not-prose rounded-xl border border-fd-border overflow-hidden">
        <div className="flex items-center justify-between border-b border-fd-border px-4 py-3">
          <span className="text-sm font-medium text-fd-foreground">Permission Rules</span>
          <button onClick={addPermission}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-transparent bg-fd-primary px-2.5 text-sm font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/80 h-8">
            + New Permission
          </button>
        </div>

        <div className="divide-y divide-fd-border">
          {permissions.map(p => (
            <button
              key={p.name}
              onClick={() => openModal(p.name)}
              className="flex w-full items-start gap-2 px-3 py-2.5 text-left transition-colors cursor-pointer hover:bg-fd-accent/50"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-fd-foreground">{p.name}</div>
                <div className="mt-0.5 truncate text-xs font-mono text-fd-muted-foreground">{p.table}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {(Object.keys(p.operations) as (keyof typeof operationLabels)[]).map(op => (
                      <span key={op} className={`rounded px-1 py-0.5 text-xs font-medium border ${operationColors[op]}`}>
                        {operationLabels[op][0]}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-fd-muted-foreground">
                    {p.roles.length} role{p.roles.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <svg className="mt-1 h-3.5 w-3.5 shrink-0 text-fd-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ))}
          {permissions.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-fd-muted-foreground">No permissions yet</div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {modalPerm && activePerm && (
        <div className="not-prose fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border border-fd-border bg-fd-card shadow-2xl [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-fd-border">
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-fd-border bg-fd-card px-6 py-4">
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 rounded-md p-1 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
              <div className="flex items-center justify-between pr-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-fd-primary/20 bg-fd-primary/10">
                    <svg className="h-5 w-5 text-fd-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-fd-foreground">Edit Permission</h3>
                    <p className="text-xs text-fd-muted-foreground">Configure rule, roles, and operations</p>
                  </div>
                </div>
              <button
                onClick={handleToggleJsonMode}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors ${
                  jsonMode
                    ? 'border-fd-primary bg-fd-primary/10 text-fd-primary hover:bg-fd-primary/20'
                    : 'border-fd-border text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground'
                }`}
              >
                {jsonMode ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
                    Apply &amp; Form
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 18l2-2-2-2"/><path d="M8 6L6 8l2 2"/><path d="M14.5 4l-5 16"/></svg>
                    JSON
                  </>
                )}
              </button>
              </div>
            </div>

            {jsonMode ? (
              /* JSON editor view */
              <div className="p-6 space-y-3">
                <textarea
                  value={jsonText}
                  onChange={e => { setJsonText(e.target.value); setJsonError(null) }}
                  spellCheck={false}
                  rows={20}
                  className="h-auto w-full rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-xs font-mono text-fd-foreground outline-none transition-colors focus-visible:border-fd-ring focus-visible:ring-3 focus-visible:ring-fd-ring/50 resize-y"
                />
                {jsonError && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-600 dark:text-red-400">
                    {jsonError}
                  </div>
                )}
              </div>
            ) : (
              /* Form view */
              <div className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-fd-foreground">Name</label>
                  <input
                    type="text"
                    value={activePerm.name}
                    onChange={e => {
                      const newName = e.target.value
                      const oldName = activePerm.name
                      setPermissions(prev => prev.map(p => p.name === oldName ? { ...p, name: newName } : p))
                      setModalPerm(newName)
                    }}
                    className="h-9 w-full rounded-lg border border-fd-border bg-fd-background px-3 text-sm text-fd-foreground outline-none transition-colors focus-visible:border-fd-ring focus-visible:ring-3 focus-visible:ring-fd-ring/50"
                  />
                </div>

                {/* Table */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-fd-foreground">Table</label>
                  <input
                    type="text"
                    value={activePerm.table}
                    onChange={e => updatePerm(activePerm.name, p => ({ ...p, table: e.target.value }))}
                    className="h-9 w-full rounded-lg border border-fd-border bg-fd-background px-3 text-sm font-mono text-fd-foreground outline-none transition-colors focus-visible:border-fd-ring focus-visible:ring-3 focus-visible:ring-fd-ring/50"
                  />
                </div>

                {/* Roles */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className="text-sm font-medium text-fd-foreground">Roles</label>
                    <button onClick={() => setEditingRoles(!editingRoles)} className="text-xs text-fd-primary hover:underline">{editingRoles ? 'Done' : 'Edit'}</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {editingRoles ? (
                      allRoles.map(role => (
                        <button key={role} onClick={() => toggleRole(activePerm.name, role)}
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                            activePerm.roles.includes(role)
                              ? 'border-fd-primary bg-fd-primary/10 text-fd-primary'
                              : 'border-fd-border text-fd-muted-foreground hover:border-fd-primary/50'
                          }`}>{role}</button>
                      ))
                    ) : (
                      activePerm.roles.map(role => (
                        <span key={role} className="rounded-full border border-fd-primary/30 bg-fd-primary/10 px-2.5 py-1 text-xs font-medium text-fd-primary">{role}</span>
                      ))
                    )}
                  </div>
                </div>

                {/* Operations toggle */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-fd-foreground">Operations</label>
                  <div className="flex gap-1.5">
                    {(Object.keys(operationLabels) as (keyof typeof operationLabels)[]).map(op => (
                      <button key={op} onClick={() => toggleOperation(activePerm.name, op)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          activePerm.operations[op] ? operationColors[op] : 'border-fd-border text-fd-muted-foreground hover:border-fd-primary/50 opacity-40'
                        }`}>{operationLabels[op]}</button>
                    ))}
                  </div>
                </div>

                {/* Operation details */}
                <div className="space-y-3">
                  {activePerm.operations.select && (() => {
                    const ops = activePerm.operations.select!
                    const update = (patch: Partial<typeof ops>) => updatePerm(activePerm.name, p => ({ ...p, operations: { ...p.operations, select: { ...p.operations.select!, ...patch } } }))
                    return (
                      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 space-y-2">
                        <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Read</div>
                        <div>
                          <span className="text-xs font-medium text-fd-muted-foreground uppercase tracking-wide">Columns</span>
                          <div className="mt-1">
                            <ColumnEditor columns={ops.columns} onChange={columns => update({ columns })} />
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-fd-muted-foreground uppercase tracking-wide">Where</span>
                          <div className="mt-1">
                            <InlineWhereEditor clauses={ops.where} onChange={where => update({ where })} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-fd-muted-foreground uppercase tracking-wide">Limit</span>
                          <input type="number" value={ops.limit} min={1} max={100000}
                            onChange={e => update({ limit: Number(e.target.value) || 100 })}
                            className="w-20 rounded-lg border border-fd-border bg-fd-background px-2 py-1 text-xs font-mono outline-none transition-colors focus-visible:border-fd-ring focus-visible:ring-3 focus-visible:ring-fd-ring/50" />
                          <span className="text-xs text-fd-muted-foreground">rows</span>
                        </div>
                      </div>
                    )
                  })()}

                  {activePerm.operations.insert && (() => {
                    const ops = activePerm.operations.insert!
                    const update = (patch: Partial<typeof ops>) => updatePerm(activePerm.name, p => ({ ...p, operations: { ...p.operations, insert: { ...p.operations.insert!, ...patch } } }))
                    return (
                      <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 space-y-2">
                        <div className="text-xs font-medium text-green-600 dark:text-green-400">Create</div>
                        <div>
                          <span className="text-xs font-medium text-fd-muted-foreground uppercase tracking-wide">Columns</span>
                          <div className="mt-1"><ColumnEditor columns={ops.columns} onChange={columns => update({ columns })} /></div>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-fd-muted-foreground uppercase tracking-wide">Validate</span>
                          <div className="mt-1"><InlineWhereEditor clauses={ops.validate} onChange={validate => update({ validate })} /></div>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-fd-muted-foreground uppercase tracking-wide">Defaults</span>
                          <div className="mt-1"><KVEditor items={ops.defaults} onChange={defaults => update({ defaults })} keyLabel="column" valueLabel="value" /></div>
                        </div>
                      </div>
                    )
                  })()}

                  {activePerm.operations.update && (() => {
                    const ops = activePerm.operations.update!
                    const update = (patch: Partial<typeof ops>) => updatePerm(activePerm.name, p => ({ ...p, operations: { ...p.operations, update: { ...p.operations.update!, ...patch } } }))
                    return (
                      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-2">
                        <div className="text-xs font-medium text-amber-600 dark:text-amber-400">Update</div>
                        <div>
                          <span className="text-xs font-medium text-fd-muted-foreground uppercase tracking-wide">Columns</span>
                          <div className="mt-1"><ColumnEditor columns={ops.columns} onChange={columns => update({ columns })} /></div>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-fd-muted-foreground uppercase tracking-wide">Where</span>
                          <div className="mt-1"><InlineWhereEditor clauses={ops.where} onChange={where => update({ where })} /></div>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-fd-muted-foreground uppercase tracking-wide">Validate</span>
                          <div className="mt-1"><InlineWhereEditor clauses={ops.validate} onChange={validate => update({ validate })} /></div>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-fd-muted-foreground uppercase tracking-wide">Overwrite</span>
                          <div className="mt-1"><KVEditor items={ops.overwrite} onChange={overwrite => update({ overwrite })} keyLabel="column" valueLabel="$user.id, $now..." /></div>
                        </div>
                      </div>
                    )
                  })()}

                  {activePerm.operations.delete && (() => {
                    const ops = activePerm.operations.delete!
                    const update = (patch: Partial<typeof ops>) => updatePerm(activePerm.name, p => ({ ...p, operations: { ...p.operations, delete: { ...p.operations.delete!, ...patch } } }))
                    return (
                      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 space-y-2">
                        <div className="text-xs font-medium text-red-600 dark:text-red-400">Delete</div>
                        <div>
                          <span className="text-xs font-medium text-fd-muted-foreground uppercase tracking-wide">Where</span>
                          <div className="mt-1"><InlineWhereEditor clauses={ops.where} onChange={where => update({ where })} /></div>
                        </div>
                        {ops.where.length === 0 && (
                          <div className="text-xs text-red-600/70 dark:text-red-400/70">No row restrictions -- any matching role can delete all rows</div>
                        )}
                      </div>
                    )
                  })()}
                </div>

                {/* Delete permission button at bottom of modal */}
                <div className="border-t border-fd-border pt-4">
                  <button onClick={() => removePermission(activePerm.name)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-500/20 px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    Delete Permission
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
