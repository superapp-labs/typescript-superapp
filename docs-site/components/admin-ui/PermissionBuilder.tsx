'use client'

import { useState } from 'react'

interface Permission {
  name: string
  table: string
  roles: string[]
  operations: {
    select?: { where?: Record<string, unknown>; columns?: string[]; limit?: number }
    insert?: { columns?: string[]; validate?: Record<string, unknown>; default?: Record<string, string> }
    update?: { columns?: string[]; where?: Record<string, unknown>; validate?: Record<string, unknown>; overwrite?: Record<string, string> }
    delete?: { where?: Record<string, unknown> }
  }
}

const allRoles = ['admin', 'manager', 'editor', 'viewer', 'customer']
const allColumns = ['id', 'customer_id', 'total', 'status', 'created_at', 'updated_at', 'notes']
const operationLabels = { select: 'Read', insert: 'Create', update: 'Update', delete: 'Delete' }
const operationColors = {
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
        where: { status: { $ne: 'deleted' } },
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
        validate: { total: { $gt: 0 } },
        default: { status: 'pending' },
      },
      update: {
        columns: ['status', 'total'],
        where: { status: { $ne: 'completed' } },
        validate: { total: { $gt: 0 } },
        overwrite: { updated_at: '$now' },
      },
      delete: {
        where: { status: { $eq: 'draft' } },
      },
    },
  },
]

function WhereDisplay({ where }: { where?: Record<string, unknown> }) {
  if (!where) return null
  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {Object.entries(where).map(([col, condition]) => {
        const [op, val] = Object.entries(condition as Record<string, string>)[0]
        return (
          <span key={col} className="inline-flex items-center gap-1 rounded bg-fd-accent px-1.5 py-0.5 text-[11px] font-mono">
            <span className="text-fd-muted-foreground">{col}</span>
            <span className="text-purple-600 dark:text-purple-400">{op}</span>
            <span className="text-fd-foreground">{typeof val === 'string' ? `'${val}'` : String(val)}</span>
          </span>
        )
      })}
    </div>
  )
}

export function PermissionBuilder() {
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions)
  const [selected, setSelected] = useState<string | null>('read_orders')
  const [editingRoles, setEditingRoles] = useState(false)

  const selectedPerm = permissions.find(p => p.name === selected)

  const toggleRole = (permName: string, role: string) => {
    setPermissions(prev => prev.map(p => {
      if (p.name !== permName) return p
      const roles = p.roles.includes(role)
        ? p.roles.filter(r => r !== role)
        : [...p.roles, role]
      return { ...p, roles }
    }))
  }

  const toggleOperation = (permName: string, op: keyof typeof operationLabels) => {
    setPermissions(prev => prev.map(p => {
      if (p.name !== permName) return p
      const operations = { ...p.operations }
      if (operations[op]) {
        delete operations[op]
      } else {
        if (op === 'select') operations[op] = { columns: ['id'], limit: 100 }
        else if (op === 'insert') operations[op] = { columns: ['id'] }
        else if (op === 'update') operations[op] = { columns: ['id'] }
        else operations[op] = {}
      }
      return { ...p, operations }
    }))
  }

  const removePermission = (name: string) => {
    setPermissions(prev => prev.filter(p => p.name !== name))
    if (selected === name) setSelected(permissions[0]?.name ?? null)
  }

  const addPermission = () => {
    const name = `new_permission_${permissions.length + 1}`
    const newPerm: Permission = {
      name,
      table: 'main.table_name',
      roles: ['admin'],
      operations: { select: { columns: ['id'], limit: 100 } },
    }
    setPermissions([...permissions, newPerm])
    setSelected(name)
  }

  return (
    <div className="not-prose rounded-xl border border-fd-border bg-fd-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-fd-border px-4 py-3">
        <span className="text-sm font-medium text-fd-foreground">Permission Rules</span>
        <button
          onClick={addPermission}
          className="rounded-lg bg-fd-primary px-3 py-1.5 text-xs font-medium text-fd-primary-foreground transition-colors hover:opacity-90"
        >
          + New Permission
        </button>
      </div>

      <div className="flex min-h-[340px]">
        {/* Sidebar */}
        <div className="w-48 shrink-0 border-r border-fd-border bg-fd-accent/30">
          {permissions.map(p => (
            <button
              key={p.name}
              onClick={() => { setSelected(p.name); setEditingRoles(false) }}
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
        </div>

        {/* Detail panel */}
        {selectedPerm ? (
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-fd-foreground">{selectedPerm.name}</h4>
                <div className="mt-0.5 text-xs font-mono text-fd-muted-foreground">{selectedPerm.table}</div>
              </div>
              <button
                onClick={() => removePermission(selectedPerm.name)}
                className="rounded p-1 text-fd-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>

            {/* Roles */}
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-fd-muted-foreground uppercase tracking-wide">Roles</span>
                <button
                  onClick={() => setEditingRoles(!editingRoles)}
                  className="text-[10px] text-fd-primary hover:underline"
                >
                  {editingRoles ? 'Done' : 'Edit'}
                </button>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {editingRoles ? (
                  allRoles.map(role => (
                    <button
                      key={role}
                      onClick={() => toggleRole(selectedPerm.name, role)}
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                        selectedPerm.roles.includes(role)
                          ? 'border-fd-primary bg-fd-primary/10 text-fd-primary'
                          : 'border-fd-border text-fd-muted-foreground hover:border-fd-primary/50'
                      }`}
                    >
                      {role}
                    </button>
                  ))
                ) : (
                  selectedPerm.roles.map(role => (
                    <span key={role} className="rounded-full border border-fd-primary/30 bg-fd-primary/10 px-2.5 py-1 text-xs font-medium text-fd-primary">
                      {role}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Operations */}
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-fd-muted-foreground uppercase tracking-wide">Operations</span>
              </div>
              <div className="mt-1.5 flex gap-1.5">
                {(Object.keys(operationLabels) as (keyof typeof operationLabels)[]).map(op => (
                  <button
                    key={op}
                    onClick={() => toggleOperation(selectedPerm.name, op)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      selectedPerm.operations[op]
                        ? operationColors[op]
                        : 'border-fd-border text-fd-muted-foreground hover:border-fd-primary/50 opacity-40'
                    }`}
                  >
                    {operationLabels[op]}
                  </button>
                ))}
              </div>
            </div>

            {/* Operation details */}
            <div className="mt-4 space-y-3">
              {selectedPerm.operations.select && (
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                  <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Read</div>
                  {selectedPerm.operations.select.columns && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {selectedPerm.operations.select.columns.map(col => (
                        <span key={col} className="rounded bg-fd-accent px-1.5 py-0.5 text-[11px] font-mono text-fd-foreground">{col}</span>
                      ))}
                    </div>
                  )}
                  <WhereDisplay where={selectedPerm.operations.select.where as Record<string, unknown> | undefined} />
                  {selectedPerm.operations.select.limit && (
                    <div className="mt-1.5 text-[11px] text-fd-muted-foreground">Limit: <span className="font-medium text-fd-foreground">{selectedPerm.operations.select.limit}</span> rows</div>
                  )}
                </div>
              )}

              {selectedPerm.operations.insert && (
                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                  <div className="text-xs font-medium text-green-600 dark:text-green-400">Create</div>
                  {selectedPerm.operations.insert.columns && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {selectedPerm.operations.insert.columns.map(col => (
                        <span key={col} className="rounded bg-fd-accent px-1.5 py-0.5 text-[11px] font-mono text-fd-foreground">{col}</span>
                      ))}
                    </div>
                  )}
                  {selectedPerm.operations.insert.validate && (
                    <div className="mt-1.5">
                      <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wide">Validate</span>
                      <WhereDisplay where={selectedPerm.operations.insert.validate as Record<string, unknown>} />
                    </div>
                  )}
                  {selectedPerm.operations.insert.default && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wide mr-1">Defaults:</span>
                      {Object.entries(selectedPerm.operations.insert.default).map(([k, v]) => (
                        <span key={k} className="inline-flex items-center gap-1 rounded bg-fd-accent px-1.5 py-0.5 text-[11px] font-mono">
                          <span className="text-fd-muted-foreground">{k}</span>
                          <span className="text-green-600 dark:text-green-400">=</span>
                          <span className="text-fd-foreground">{`'${v}'`}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedPerm.operations.update && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                  <div className="text-xs font-medium text-amber-600 dark:text-amber-400">Update</div>
                  {selectedPerm.operations.update.columns && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {selectedPerm.operations.update.columns.map(col => (
                        <span key={col} className="rounded bg-fd-accent px-1.5 py-0.5 text-[11px] font-mono text-fd-foreground">{col}</span>
                      ))}
                    </div>
                  )}
                  <WhereDisplay where={selectedPerm.operations.update.where as Record<string, unknown> | undefined} />
                  {selectedPerm.operations.update.overwrite && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wide mr-1">Overwrite:</span>
                      {Object.entries(selectedPerm.operations.update.overwrite).map(([k, v]) => (
                        <span key={k} className="inline-flex items-center gap-1 rounded bg-fd-accent px-1.5 py-0.5 text-[11px] font-mono">
                          <span className="text-fd-muted-foreground">{k}</span>
                          <span className="text-amber-600 dark:text-amber-400">=</span>
                          <span className="text-fd-foreground">{v}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedPerm.operations.delete && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                  <div className="text-xs font-medium text-red-600 dark:text-red-400">Delete</div>
                  <WhereDisplay where={selectedPerm.operations.delete.where as Record<string, unknown> | undefined} />
                  {!selectedPerm.operations.delete.where && (
                    <div className="mt-1 text-[11px] text-fd-muted-foreground">No row restrictions</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-fd-muted-foreground">
            Select a permission to view details
          </div>
        )}
      </div>
    </div>
  )
}
