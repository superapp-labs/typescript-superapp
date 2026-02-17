'use client'

import { useState } from 'react'

interface RoleConfig {
  name: string
  permissions: string[]
  actions: string[]
  userCount: number
  color: string
}

const roleColors = ['bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-cyan-500', 'bg-pink-500', 'bg-teal-500']
const availablePermissions = ['read_orders', 'manage_orders', 'read_users', 'manage_users', 'read_products', 'manage_products', 'read_analytics', 'manage_settings']
const availableActions = ['incrementStock', 'decrementStock', 'resetStock', 'inviteMember', 'revenueReport', 'applyDiscount', 'transfer']

const initialRoles: RoleConfig[] = [
  { name: 'admin', permissions: ['read_orders', 'manage_orders', 'read_users', 'manage_users', 'read_products', 'manage_products'], actions: ['incrementStock', 'resetStock', 'inviteMember', 'revenueReport'], userCount: 3, color: 'bg-red-500' },
  { name: 'manager', permissions: ['read_orders', 'manage_orders', 'read_products'], actions: ['incrementStock'], userCount: 8, color: 'bg-amber-500' },
  { name: 'editor', permissions: ['read_orders', 'read_products', 'manage_products'], actions: [], userCount: 15, color: 'bg-blue-500' },
  { name: 'viewer', permissions: ['read_orders', 'read_products'], actions: ['revenueReport'], userCount: 42, color: 'bg-green-500' },
  { name: 'customer', permissions: ['read_orders'], actions: ['applyDiscount'], userCount: 1284, color: 'bg-purple-500' },
]

function ChipList({ items, allItems, onAdd, onRemove, colorClass }: {
  items: string[]; allItems: string[]; onAdd: (item: string) => void; onRemove: (item: string) => void; colorClass: string
}) {
  const [adding, setAdding] = useState(false)
  const remaining = allItems.filter(i => !items.includes(i))

  return (
    <div className="flex flex-wrap items-center gap-1">
      {items.map(item => (
        <span key={item} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-mono font-medium ${colorClass}`}>
          {item}
          <button onClick={() => onRemove(item)} className="opacity-50 hover:opacity-100">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </span>
      ))}
      {adding ? (
        <select autoFocus
          onChange={e => { if (e.target.value) { onAdd(e.target.value); setAdding(false) } }}
          onBlur={() => setAdding(false)}
          className="rounded-full border border-fd-primary bg-fd-background px-2 py-0.5 text-[11px] font-mono text-fd-foreground focus:outline-none">
          <option value="">select...</option>
          {remaining.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
      ) : remaining.length > 0 ? (
        <button onClick={() => setAdding(true)}
          className="rounded-full border border-dashed border-fd-border px-2 py-0.5 text-[10px] text-fd-muted-foreground hover:border-fd-primary hover:text-fd-primary">
          +
        </button>
      ) : null}
    </div>
  )
}

export function RoleOverview() {
  const [roles, setRoles] = useState(initialRoles)
  const [expanded, setExpanded] = useState<string | null>('admin')
  const [view, setView] = useState<'list' | 'matrix'>('list')
  const [addingRole, setAddingRole] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')

  const allPermissions = [...new Set(roles.flatMap(r => r.permissions))]
  const allActions = [...new Set(roles.flatMap(r => r.actions))]

  const updateRole = (name: string, fn: (r: RoleConfig) => RoleConfig) => {
    setRoles(prev => prev.map(r => r.name === name ? fn(r) : r))
  }

  const removeRole = (name: string) => {
    setRoles(prev => prev.filter(r => r.name !== name))
    if (expanded === name) setExpanded(null)
  }

  const addRole = () => {
    if (!newRoleName || roles.some(r => r.name === newRoleName)) return
    const color = roleColors[roles.length % roleColors.length]
    setRoles([...roles, { name: newRoleName, permissions: [], actions: [], userCount: 0, color }])
    setExpanded(newRoleName)
    setNewRoleName('')
    setAddingRole(false)
  }

  const toggleMatrixCell = (roleName: string, item: string, type: 'permissions' | 'actions') => {
    updateRole(roleName, r => ({
      ...r,
      [type]: r[type].includes(item)
        ? r[type].filter(i => i !== item)
        : [...r[type], item],
    }))
  }

  return (
    <div className="not-prose rounded-xl border border-fd-border bg-fd-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-fd-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-fd-foreground">Roles & Access</span>
          <span className="rounded-full bg-fd-accent px-2 py-0.5 text-xs text-fd-muted-foreground">{roles.length} roles</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg bg-fd-accent p-0.5">
            <button onClick={() => setView('list')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${view === 'list' ? 'bg-fd-background text-fd-foreground shadow-sm' : 'text-fd-muted-foreground'}`}>
              List
            </button>
            <button onClick={() => setView('matrix')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${view === 'matrix' ? 'bg-fd-background text-fd-foreground shadow-sm' : 'text-fd-muted-foreground'}`}>
              Matrix
            </button>
          </div>
          <button onClick={() => setAddingRole(true)}
            className="rounded-lg bg-fd-primary px-3 py-1.5 text-xs font-medium text-fd-primary-foreground transition-colors hover:opacity-90">
            + Add Role
          </button>
        </div>
      </div>

      {/* Add role inline */}
      {addingRole && (
        <div className="flex items-center gap-2 border-b border-fd-border bg-fd-accent/40 px-4 py-2.5">
          <input autoFocus type="text" placeholder="Role name (e.g. support)" value={newRoleName}
            onChange={e => setNewRoleName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addRole(); if (e.key === 'Escape') setAddingRole(false) }}
            className="w-48 rounded-lg border border-fd-border bg-fd-background px-3 py-1.5 text-xs text-fd-foreground placeholder:text-fd-muted-foreground focus:outline-none focus:ring-2 focus:ring-fd-primary" />
          <button onClick={addRole} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700">Create</button>
          <button onClick={() => { setAddingRole(false); setNewRoleName('') }} className="rounded-lg border border-fd-border px-3 py-1.5 text-xs text-fd-muted-foreground hover:bg-fd-accent">Cancel</button>
        </div>
      )}

      {view === 'list' ? (
        <div className="divide-y divide-fd-border">
          {roles.map(role => (
            <div key={role.name}>
              {/* Row header */}
              <button
                onClick={() => setExpanded(expanded === role.name ? null : role.name)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-fd-accent/30 ${expanded === role.name ? 'bg-fd-accent/20' : ''}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={`shrink-0 text-fd-muted-foreground transition-transform ${expanded === role.name ? 'rotate-90' : ''}`}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${role.color}`} />
                <span className="text-sm font-semibold text-fd-foreground">{role.name}</span>
                <div className="flex items-center gap-3 ml-auto text-[11px] text-fd-muted-foreground">
                  <span>{role.permissions.length} permissions</span>
                  <span>{role.actions.length} actions</span>
                  <span>{role.userCount.toLocaleString()} users</span>
                </div>
              </button>

              {/* Expanded detail */}
              {expanded === role.name && (
                <div className="border-t border-fd-border bg-fd-accent/10 px-4 py-4 pl-11">
                  <div className="space-y-4">
                    {/* Permissions */}
                    <div>
                      <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wide font-medium">Permissions</span>
                      <div className="mt-1.5">
                        <ChipList
                          items={role.permissions}
                          allItems={availablePermissions}
                          onAdd={p => updateRole(role.name, r => ({ ...r, permissions: [...r.permissions, p] }))}
                          onRemove={p => updateRole(role.name, r => ({ ...r, permissions: r.permissions.filter(x => x !== p) }))}
                          colorClass="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wide font-medium">Actions</span>
                      <div className="mt-1.5">
                        <ChipList
                          items={role.actions}
                          allItems={availableActions}
                          onAdd={a => updateRole(role.name, r => ({ ...r, actions: [...r.actions, a] }))}
                          onRemove={a => updateRole(role.name, r => ({ ...r, actions: r.actions.filter(x => x !== a) }))}
                          colorClass="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button onClick={() => removeRole(role.name)}
                      className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-[11px] font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-500/10">
                      Delete Role
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {roles.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-fd-muted-foreground">
              No roles defined. Click &quot;+ Add Role&quot; to get started.
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-fd-border bg-fd-accent/30">
                <th className="sticky left-0 z-10 bg-fd-accent/30 px-3 py-2 text-left text-[10px] font-medium text-fd-muted-foreground uppercase tracking-wide">Access</th>
                {roles.map(r => (
                  <th key={r.name} className="px-3 py-2 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`h-2 w-2 rounded-full ${r.color}`} />
                      <span className="text-[10px] font-medium text-fd-foreground">{r.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-fd-border">
              {allPermissions.length > 0 && (
                <tr>
                  <td className="sticky left-0 z-10 bg-fd-card px-3 py-1 text-[10px] text-fd-muted-foreground uppercase tracking-wide font-medium" colSpan={1}>Permissions</td>
                  {roles.map(r => <td key={r.name} />)}
                </tr>
              )}
              {allPermissions.map(p => (
                <tr key={p} className="hover:bg-fd-accent/20">
                  <td className="sticky left-0 z-10 bg-fd-card px-3 py-1.5 font-mono text-[11px] text-fd-foreground">{p}</td>
                  {roles.map(r => (
                    <td key={r.name} className="px-3 py-1.5 text-center">
                      <button onClick={() => toggleMatrixCell(r.name, p, 'permissions')}
                        className={`inline-flex h-5 w-5 items-center justify-center rounded transition-colors ${
                          r.permissions.includes(p)
                            ? 'bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-red-500/20 hover:text-red-500'
                            : 'bg-fd-accent text-fd-muted-foreground/30 hover:bg-green-500/10 hover:text-green-600'
                        }`}>
                        {r.permissions.includes(p) ? <span className="text-[11px]">&#10003;</span> : <span className="text-[11px]">+</span>}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
              {allActions.length > 0 && (
                <tr className="border-t-2 border-fd-border">
                  <td className="sticky left-0 z-10 bg-fd-card px-3 py-1 text-[10px] text-fd-muted-foreground uppercase tracking-wide font-medium" colSpan={1}>Actions</td>
                  {roles.map(r => <td key={r.name} />)}
                </tr>
              )}
              {allActions.map(a => (
                <tr key={a} className="hover:bg-fd-accent/20">
                  <td className="sticky left-0 z-10 bg-fd-card px-3 py-1.5 font-mono text-[11px] text-fd-foreground">{a}</td>
                  {roles.map(r => (
                    <td key={r.name} className="px-3 py-1.5 text-center">
                      <button onClick={() => toggleMatrixCell(r.name, a, 'actions')}
                        className={`inline-flex h-5 w-5 items-center justify-center rounded transition-colors ${
                          r.actions.includes(a)
                            ? 'bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-red-500/20 hover:text-red-500'
                            : 'bg-fd-accent text-fd-muted-foreground/30 hover:bg-green-500/10 hover:text-green-600'
                        }`}>
                        {r.actions.includes(a) ? <span className="text-[11px]">&#10003;</span> : <span className="text-[11px]">+</span>}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
