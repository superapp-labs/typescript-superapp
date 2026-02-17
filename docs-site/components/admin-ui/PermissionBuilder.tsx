'use client'

import { useState } from 'react'

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
    <button onClick={onClick} title={title} className="rounded p-0.5 text-fd-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500">
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
            className="w-28 rounded border border-fd-border bg-fd-background px-1.5 py-0.5 text-[11px] font-mono text-fd-foreground focus:outline-none focus:ring-1 focus:ring-fd-primary">
            {sampleColumns.map(col => <option key={col} value={col}>{col}</option>)}
          </select>
          <select value={c.operator} onChange={e => { const n = [...clauses]; n[i] = { ...c, operator: e.target.value }; onChange(n) }}
            className="w-16 rounded border border-fd-border bg-fd-background px-1 py-0.5 text-[11px] font-mono text-purple-600 dark:text-purple-400 focus:outline-none focus:ring-1 focus:ring-fd-primary">
            {operators.map(op => <option key={op} value={op}>{op}</option>)}
          </select>
          <input value={c.value} onChange={e => { const n = [...clauses]; n[i] = { ...c, value: e.target.value }; onChange(n) }}
            className="w-24 rounded border border-fd-border bg-fd-background px-1.5 py-0.5 text-[11px] font-mono text-fd-foreground focus:outline-none focus:ring-1 focus:ring-fd-primary" />
          <XButton onClick={() => onChange(clauses.filter((_, j) => j !== i))} />
        </div>
      ))}
      <button onClick={() => onChange([...clauses, { column: 'id', operator: '$eq', value: '' }])}
        className="text-[10px] text-fd-primary hover:underline">+ Add condition</button>
    </div>
  )
}

function KVEditor({ items, onChange, keyLabel, valueLabel }: { items: { key: string; value: string }[]; onChange: (v: { key: string; value: string }[]) => void; keyLabel: string; valueLabel: string }) {
  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <input value={item.key} placeholder={keyLabel} onChange={e => { const n = [...items]; n[i] = { ...item, key: e.target.value }; onChange(n) }}
            className="w-28 rounded border border-fd-border bg-fd-background px-1.5 py-0.5 text-[11px] font-mono text-fd-muted-foreground focus:outline-none focus:ring-1 focus:ring-fd-primary" />
          <span className="text-[11px] text-fd-muted-foreground">=</span>
          <input value={item.value} placeholder={valueLabel} onChange={e => { const n = [...items]; n[i] = { ...item, value: e.target.value }; onChange(n) }}
            className="w-28 rounded border border-fd-border bg-fd-background px-1.5 py-0.5 text-[11px] font-mono text-fd-foreground focus:outline-none focus:ring-1 focus:ring-fd-primary" />
          <XButton onClick={() => onChange(items.filter((_, j) => j !== i))} />
        </div>
      ))}
      <button onClick={() => onChange([...items, { key: '', value: '' }])}
        className="text-[10px] text-fd-primary hover:underline">+ Add</button>
    </div>
  )
}

function ColumnEditor({ columns, onChange }: { columns: string[]; onChange: (c: string[]) => void }) {
  const [adding, setAdding] = useState(false)
  const available = sampleColumns.filter(c => !columns.includes(c))
  return (
    <div className="flex flex-wrap items-center gap-1">
      {columns.map(col => (
        <span key={col} className="inline-flex items-center gap-1 rounded bg-fd-accent px-1.5 py-0.5 text-[11px] font-mono text-fd-foreground">
          {col}
          <button onClick={() => onChange(columns.filter(c => c !== col))} className="text-fd-muted-foreground hover:text-red-500">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </span>
      ))}
      {adding ? (
        <select
          autoFocus
          onChange={e => { if (e.target.value) { onChange([...columns, e.target.value]); setAdding(false) } }}
          onBlur={() => setAdding(false)}
          className="rounded border border-fd-primary bg-fd-background px-1 py-0.5 text-[11px] font-mono text-fd-foreground focus:outline-none"
        >
          <option value="">select...</option>
          {available.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      ) : (
        <button onClick={() => setAdding(true)} className="rounded border border-dashed border-fd-border px-1.5 py-0.5 text-[10px] text-fd-muted-foreground hover:border-fd-primary hover:text-fd-primary">+</button>
      )}
    </div>
  )
}

// --- main component ---

export function PermissionBuilder() {
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions)
  const [selected, setSelected] = useState<string | null>('read_orders')
  const [editingRoles, setEditingRoles] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [editingTable, setEditingTable] = useState(false)

  const selectedPerm = permissions.find(p => p.name === selected)

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

  const renamePerm = (oldName: string, newName: string) => {
    if (!newName || permissions.some(p => p.name === newName && p.name !== oldName)) return
    setPermissions(prev => prev.map(p => p.name === oldName ? { ...p, name: newName } : p))
    if (selected === oldName) setSelected(newName)
    setEditingName(false)
  }

  const removePermission = (name: string) => {
    const remaining = permissions.filter(p => p.name !== name)
    setPermissions(remaining)
    setSelected(remaining.length > 0 ? remaining[0].name : null)
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
    setSelected(name)
    setEditingName(true)
  }

  return (
    <div className="not-prose rounded-xl border border-fd-border bg-fd-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-fd-border px-4 py-3">
        <span className="text-sm font-medium text-fd-foreground">Permission Rules</span>
        <button onClick={addPermission}
          className="rounded-lg bg-fd-primary px-3 py-1.5 text-xs font-medium text-fd-primary-foreground transition-colors hover:opacity-90">
          + New Permission
        </button>
      </div>

      <div className="flex min-h-[400px]">
        {/* Sidebar */}
        <div className="w-48 shrink-0 border-r border-fd-border bg-fd-accent/30 overflow-y-auto">
          {permissions.map(p => (
            <button
              key={p.name}
              onClick={() => { setSelected(p.name); setEditingRoles(false); setEditingName(false); setEditingTable(false) }}
              className={`flex w-full items-start gap-2 border-b border-fd-border px-3 py-2.5 text-left transition-colors ${
                selected === p.name ? 'bg-fd-primary/10 border-l-2 border-l-fd-primary' : 'hover:bg-fd-accent/50'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-fd-foreground">{p.name}</div>
                <div className="mt-0.5 truncate text-[10px] font-mono text-fd-muted-foreground">{p.table}</div>
                <div className="mt-1 flex gap-0.5">
                  {(Object.keys(p.operations) as (keyof typeof operationLabels)[]).map(op => (
                    <span key={op} className={`rounded px-1 py-0.5 text-[9px] font-medium border ${operationColors[op]}`}>
                      {operationLabels[op][0]}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
          {permissions.length === 0 && (
            <div className="px-3 py-6 text-center text-[11px] text-fd-muted-foreground">No permissions yet</div>
          )}
        </div>

        {/* Detail panel */}
        {selectedPerm ? (
          <div className="flex-1 overflow-y-auto p-4">
            {/* Header: name + table (editable) */}
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                {editingName ? (
                  <input autoFocus defaultValue={selectedPerm.name}
                    onBlur={e => renamePerm(selectedPerm.name, e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') renamePerm(selectedPerm.name, (e.target as HTMLInputElement).value) }}
                    className="w-full rounded border border-fd-primary bg-fd-background px-2 py-0.5 text-sm font-semibold text-fd-foreground focus:outline-none" />
                ) : (
                  <h4 className="cursor-pointer text-sm font-semibold text-fd-foreground hover:text-fd-primary" onClick={() => setEditingName(true)}>
                    {selectedPerm.name} <span className="text-[10px] font-normal text-fd-muted-foreground">(click to rename)</span>
                  </h4>
                )}
                {editingTable ? (
                  <input autoFocus defaultValue={selectedPerm.table}
                    onBlur={e => { updatePerm(selectedPerm.name, p => ({ ...p, table: e.target.value })); setEditingTable(false) }}
                    onKeyDown={e => { if (e.key === 'Enter') { updatePerm(selectedPerm.name, p => ({ ...p, table: (e.target as HTMLInputElement).value })); setEditingTable(false) } }}
                    className="mt-0.5 w-full rounded border border-fd-primary bg-fd-background px-2 py-0.5 text-xs font-mono text-fd-foreground focus:outline-none" />
                ) : (
                  <div className="mt-0.5 cursor-pointer text-xs font-mono text-fd-muted-foreground hover:text-fd-primary" onClick={() => setEditingTable(true)}>
                    {selectedPerm.table}
                  </div>
                )}
              </div>
              <button onClick={() => removePermission(selectedPerm.name)}
                className="ml-2 rounded p-1 text-fd-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500" title="Delete permission">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>

            {/* Roles */}
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-fd-muted-foreground uppercase tracking-wide">Roles</span>
                <button onClick={() => setEditingRoles(!editingRoles)} className="text-[10px] text-fd-primary hover:underline">{editingRoles ? 'Done' : 'Edit'}</button>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {editingRoles ? (
                  allRoles.map(role => (
                    <button key={role} onClick={() => toggleRole(selectedPerm.name, role)}
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                        selectedPerm.roles.includes(role)
                          ? 'border-fd-primary bg-fd-primary/10 text-fd-primary'
                          : 'border-fd-border text-fd-muted-foreground hover:border-fd-primary/50'
                      }`}>{role}</button>
                  ))
                ) : (
                  selectedPerm.roles.map(role => (
                    <span key={role} className="rounded-full border border-fd-primary/30 bg-fd-primary/10 px-2.5 py-1 text-xs font-medium text-fd-primary">{role}</span>
                  ))
                )}
              </div>
            </div>

            {/* Operations toggle */}
            <div className="mt-4">
              <span className="text-xs font-medium text-fd-muted-foreground uppercase tracking-wide">Operations</span>
              <div className="mt-1.5 flex gap-1.5">
                {(Object.keys(operationLabels) as (keyof typeof operationLabels)[]).map(op => (
                  <button key={op} onClick={() => toggleOperation(selectedPerm.name, op)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      selectedPerm.operations[op] ? operationColors[op] : 'border-fd-border text-fd-muted-foreground hover:border-fd-primary/50 opacity-40'
                    }`}>{operationLabels[op]}</button>
                ))}
              </div>
            </div>

            {/* Operation details — fully editable */}
            <div className="mt-4 space-y-3">
              {selectedPerm.operations.select && (() => {
                const ops = selectedPerm.operations.select!
                const update = (patch: Partial<typeof ops>) => updatePerm(selectedPerm.name, p => ({ ...p, operations: { ...p.operations, select: { ...p.operations.select!, ...patch } } }))
                return (
                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 space-y-2">
                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Read</div>
                    <div>
                      <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wide">Columns</span>
                      <div className="mt-1">
                        <ColumnEditor columns={ops.columns} onChange={columns => update({ columns })} />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wide">Where</span>
                      <div className="mt-1">
                        <InlineWhereEditor clauses={ops.where} onChange={where => update({ where })} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wide">Limit</span>
                      <input type="number" value={ops.limit} min={1} max={100000}
                        onChange={e => update({ limit: Number(e.target.value) || 100 })}
                        className="w-20 rounded border border-fd-border bg-fd-background px-1.5 py-0.5 text-[11px] font-mono text-fd-foreground focus:outline-none focus:ring-1 focus:ring-fd-primary" />
                      <span className="text-[10px] text-fd-muted-foreground">rows</span>
                    </div>
                  </div>
                )
              })()}

              {selectedPerm.operations.insert && (() => {
                const ops = selectedPerm.operations.insert!
                const update = (patch: Partial<typeof ops>) => updatePerm(selectedPerm.name, p => ({ ...p, operations: { ...p.operations, insert: { ...p.operations.insert!, ...patch } } }))
                return (
                  <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 space-y-2">
                    <div className="text-xs font-medium text-green-600 dark:text-green-400">Create</div>
                    <div>
                      <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wide">Columns</span>
                      <div className="mt-1"><ColumnEditor columns={ops.columns} onChange={columns => update({ columns })} /></div>
                    </div>
                    <div>
                      <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wide">Validate</span>
                      <div className="mt-1"><InlineWhereEditor clauses={ops.validate} onChange={validate => update({ validate })} /></div>
                    </div>
                    <div>
                      <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wide">Defaults</span>
                      <div className="mt-1"><KVEditor items={ops.defaults} onChange={defaults => update({ defaults })} keyLabel="column" valueLabel="value" /></div>
                    </div>
                  </div>
                )
              })()}

              {selectedPerm.operations.update && (() => {
                const ops = selectedPerm.operations.update!
                const update = (patch: Partial<typeof ops>) => updatePerm(selectedPerm.name, p => ({ ...p, operations: { ...p.operations, update: { ...p.operations.update!, ...patch } } }))
                return (
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-2">
                    <div className="text-xs font-medium text-amber-600 dark:text-amber-400">Update</div>
                    <div>
                      <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wide">Columns</span>
                      <div className="mt-1"><ColumnEditor columns={ops.columns} onChange={columns => update({ columns })} /></div>
                    </div>
                    <div>
                      <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wide">Where</span>
                      <div className="mt-1"><InlineWhereEditor clauses={ops.where} onChange={where => update({ where })} /></div>
                    </div>
                    <div>
                      <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wide">Validate</span>
                      <div className="mt-1"><InlineWhereEditor clauses={ops.validate} onChange={validate => update({ validate })} /></div>
                    </div>
                    <div>
                      <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wide">Overwrite</span>
                      <div className="mt-1"><KVEditor items={ops.overwrite} onChange={overwrite => update({ overwrite })} keyLabel="column" valueLabel="$user.id, $now..." /></div>
                    </div>
                  </div>
                )
              })()}

              {selectedPerm.operations.delete && (() => {
                const ops = selectedPerm.operations.delete!
                const update = (patch: Partial<typeof ops>) => updatePerm(selectedPerm.name, p => ({ ...p, operations: { ...p.operations, delete: { ...p.operations.delete!, ...patch } } }))
                return (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 space-y-2">
                    <div className="text-xs font-medium text-red-600 dark:text-red-400">Delete</div>
                    <div>
                      <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wide">Where</span>
                      <div className="mt-1"><InlineWhereEditor clauses={ops.where} onChange={where => update({ where })} /></div>
                    </div>
                    {ops.where.length === 0 && (
                      <div className="text-[11px] text-red-600/70 dark:text-red-400/70">No row restrictions — any matching role can delete all rows</div>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-fd-muted-foreground">
            {permissions.length > 0 ? 'Select a permission to view details' : 'Click "+ New Permission" to get started'}
          </div>
        )}
      </div>
    </div>
  )
}
