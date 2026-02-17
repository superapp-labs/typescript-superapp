'use client'

import { useState } from 'react'

interface RoleConfig {
  name: string
  description: string
  permissions: string[]
  actions: string[]
  userCount: number
  color: string
}

const roleColors = ['bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-cyan-500', 'bg-pink-500', 'bg-teal-500']
const availablePermissions = ['read_orders', 'manage_orders', 'read_users', 'manage_users', 'read_products', 'manage_products', 'read_analytics', 'manage_settings']
const availableActions = ['incrementStock', 'decrementStock', 'resetStock', 'inviteMember', 'revenueReport', 'applyDiscount', 'transfer']

const initialRoles: RoleConfig[] = [
  { name: 'admin', description: 'Full system access', permissions: ['read_orders', 'manage_orders', 'read_users', 'manage_users', 'read_products', 'manage_products'], actions: ['incrementStock', 'resetStock', 'inviteMember', 'revenueReport'], userCount: 3, color: 'bg-red-500' },
  { name: 'manager', description: 'Team and order management', permissions: ['read_orders', 'manage_orders', 'read_products'], actions: ['incrementStock'], userCount: 8, color: 'bg-amber-500' },
  { name: 'editor', description: 'Content and product editing', permissions: ['read_orders', 'read_products', 'manage_products'], actions: [], userCount: 15, color: 'bg-blue-500' },
  { name: 'viewer', description: 'Read-only dashboard access', permissions: ['read_orders', 'read_products'], actions: ['revenueReport'], userCount: 42, color: 'bg-green-500' },
  { name: 'customer', description: 'End-user with limited access', permissions: ['read_orders'], actions: ['applyDiscount'], userCount: 1284, color: 'bg-purple-500' },
]

// --- Editable chip list ---

function EditableChipList({ items, allItems, onAdd, onRemove, emptyText, accentColor }: {
  items: string[]
  allItems: string[]
  onAdd: (item: string) => void
  onRemove: (item: string) => void
  emptyText: string
  accentColor: 'blue' | 'amber'
}) {
  const [showDropdown, setShowDropdown] = useState(false)
  const remaining = allItems.filter(i => !items.includes(i))

  const chipClasses = accentColor === 'blue'
    ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300'
    : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300'

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.length === 0 && (
        <span className="text-xs italic text-fd-muted-foreground">{emptyText}</span>
      )}
      {items.map(item => (
        <span key={item} className={`group inline-flex items-center gap-1.5 rounded-md border px-2 py-[3px] text-xs font-mono font-medium leading-none ${chipClasses}`}>
          {item}
          <button onClick={() => onRemove(item)}
            className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </span>
      ))}
      {remaining.length > 0 && (
        showDropdown ? (
          <select autoFocus
            onChange={e => { if (e.target.value) { onAdd(e.target.value); setShowDropdown(false) } }}
            onBlur={() => setShowDropdown(false)}
            className="rounded-lg border border-fd-primary/50 bg-fd-background px-2 py-[3px] text-xs font-mono text-fd-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-fd-primary">
            <option value="">Add...</option>
            {remaining.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        ) : (
          <button onClick={() => setShowDropdown(true)}
            className="inline-flex h-[22px] items-center gap-0.5 rounded-lg border border-dashed border-fd-border px-2 text-xs font-medium text-fd-muted-foreground transition-colors hover:border-fd-primary hover:text-fd-primary">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Add
          </button>
        )
      )}
    </div>
  )
}

// --- Stat badge ---

function StatBadge({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-fd-accent/60 px-2 py-1">
      <span className="text-fd-muted-foreground">{icon}</span>
      <span className="text-xs font-semibold tabular-nums text-fd-foreground">{value.toLocaleString()}</span>
      <span className="text-xs text-fd-muted-foreground">{label}</span>
    </div>
  )
}

// --- Main component ---

export function RoleOverview() {
  const [roles, setRoles] = useState(initialRoles)
  const [editingRole, setEditingRole] = useState<RoleConfig | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [view, setView] = useState<'list' | 'matrix'>('list')
  const [addingRole, setAddingRole] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const allPermissions = [...new Set(roles.flatMap(r => r.permissions))]
  const allActions = [...new Set(roles.flatMap(r => r.actions))]

  const updateRole = (name: string, fn: (r: RoleConfig) => RoleConfig) => {
    setRoles(prev => prev.map(r => r.name === name ? fn(r) : r))
  }

  const openEdit = (role: RoleConfig) => {
    setEditingRole(role)
    setEditName(role.name)
    setEditDesc(role.description)
    setConfirmDelete(false)
  }

  const saveEdit = () => {
    if (!editingRole || !editName) return
    setRoles(prev => prev.map(r =>
      r.name === editingRole.name
        ? { ...r, name: editName, description: editDesc }
        : r
    ))
    setEditingRole({ ...editingRole, name: editName, description: editDesc })
  }

  const removeRole = (name: string) => {
    setRoles(prev => prev.filter(r => r.name !== name))
    setEditingRole(null)
    setConfirmDelete(false)
  }

  const addRole = () => {
    if (!newRoleName || roles.some(r => r.name === newRoleName)) return
    const color = roleColors[roles.length % roleColors.length]
    const newRole: RoleConfig = { name: newRoleName, description: '', permissions: [], actions: [], userCount: 0, color }
    setRoles([...roles, newRole])
    setNewRoleName('')
    setAddingRole(false)
    openEdit(newRole)
  }

  const toggleMatrixCell = (roleName: string, item: string, type: 'permissions' | 'actions') => {
    updateRole(roleName, r => ({
      ...r,
      [type]: r[type].includes(item) ? r[type].filter(i => i !== item) : [...r[type], item],
    }))
  }

  // Keep modal state in sync with roles array
  const currentEditRole = editingRole ? roles.find(r => r.name === editingRole.name) ?? editingRole : null

  return (
    <>
      <div className="not-prose rounded-xl border border-fd-border overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-fd-border px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-fd-primary/10">
              <svg className="h-3.5 w-3.5 text-fd-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-fd-foreground">Roles & Access</span>
            <span className="rounded-full bg-fd-primary/10 px-2 py-0.5 text-xs font-medium tabular-nums text-fd-primary">{roles.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-fd-border p-0.5">
              <button onClick={() => setView('list')}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${view === 'list' ? 'bg-fd-accent text-fd-foreground shadow-sm' : 'text-fd-muted-foreground hover:text-fd-foreground'}`}>
                List
              </button>
              <button onClick={() => setView('matrix')}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${view === 'matrix' ? 'bg-fd-accent text-fd-foreground shadow-sm' : 'text-fd-muted-foreground hover:text-fd-foreground'}`}>
                Matrix
              </button>
            </div>
            <button onClick={() => setAddingRole(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-transparent bg-fd-primary px-3 py-1.5 text-xs font-medium text-fd-primary-foreground transition-all hover:bg-fd-primary/90 active:scale-[0.97]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              Add Role
            </button>
          </div>
        </div>

        {/* Inline add */}
        {addingRole && (
          <div className="flex items-center gap-2 border-b border-fd-border bg-fd-accent/30 px-5 py-3">
            <input autoFocus type="text" placeholder="Role name, e.g. support" value={newRoleName}
              onChange={e => setNewRoleName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addRole(); if (e.key === 'Escape') setAddingRole(false) }}
              className="w-52 h-8 rounded-lg border border-fd-border bg-fd-background px-2.5 text-sm text-fd-foreground placeholder:text-fd-muted-foreground outline-none transition-colors focus-visible:border-fd-ring focus-visible:ring-3 focus-visible:ring-fd-ring/50" />
            <button onClick={addRole}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-fd-primary px-3 text-xs font-medium text-fd-primary-foreground transition-all hover:bg-fd-primary/90 disabled:pointer-events-none disabled:opacity-50">Create</button>
            <button onClick={() => { setAddingRole(false); setNewRoleName('') }}
              className="inline-flex h-8 items-center rounded-lg px-3 text-xs text-fd-muted-foreground hover:text-fd-foreground">Cancel</button>
          </div>
        )}

        {/* List view */}
        {view === 'list' ? (
          <div>
            {roles.map((role, idx) => {
              const isLast = idx === roles.length - 1
              return (
                <div key={role.name} className={!isLast ? 'border-b border-fd-border' : ''}>
                  <button
                    onClick={() => openEdit(role)}
                    className="group flex w-full items-center gap-0 px-0 py-0 text-left transition-colors hover:bg-fd-accent/40 cursor-pointer"
                  >
                    {/* Color accent bar */}
                    <div className={`w-1 self-stretch ${role.color} opacity-40 group-hover:opacity-70 transition-opacity`} />

                    <div className="flex flex-1 items-center gap-3 px-4 py-3.5">
                      {/* Role name + description */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-fd-foreground">{role.name}</span>
                          {role.description && (
                            <span className="truncate text-xs text-fd-muted-foreground">{role.description}</span>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-2 shrink-0">
                        <StatBadge
                          icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
                          value={role.permissions.length}
                          label="perm"
                        />
                        <StatBadge
                          icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
                          value={role.actions.length}
                          label="act"
                        />
                        <StatBadge
                          icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                          value={role.userCount}
                          label="users"
                        />
                      </div>

                      {/* Arrow hint */}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        className="shrink-0 text-fd-muted-foreground/50 transition-colors group-hover:text-fd-foreground">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </button>
                </div>
              )
            })}
            {roles.length === 0 && (
              <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-fd-muted-foreground/50">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <p className="text-sm text-fd-muted-foreground">No roles defined</p>
                <button onClick={() => setAddingRole(true)}
                  className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-fd-primary px-3 py-1.5 text-xs font-medium text-fd-primary-foreground transition-all hover:bg-fd-primary/90">
                  Create your first role
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Matrix view */
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-fd-border bg-fd-accent/30">
                  <th className="sticky left-0 z-10 bg-fd-accent/30 px-4 py-2.5 text-left text-xs font-semibold text-fd-muted-foreground uppercase tracking-wider">Access</th>
                  {roles.map(r => (
                    <th key={r.name} className="px-3 py-2.5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`h-2.5 w-2.5 rounded-full ${r.color}`} />
                        <span className="text-xs font-semibold text-fd-foreground">{r.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-fd-border">
                {allPermissions.length > 0 && (
                  <tr>
                    <td className="sticky left-0 z-10 bg-fd-card px-4 py-1.5 text-xs font-semibold text-fd-muted-foreground uppercase tracking-wider" colSpan={1}>Permissions</td>
                    {roles.map(r => <td key={r.name} />)}
                  </tr>
                )}
                {allPermissions.map(p => (
                  <tr key={p} className="hover:bg-fd-accent/20 transition-colors cursor-pointer">
                    <td className="sticky left-0 z-10 bg-fd-card px-4 py-2 text-xs font-mono">{p}</td>
                    {roles.map(r => (
                      <td key={r.name} className="px-3 py-2 text-center">
                        <button onClick={() => toggleMatrixCell(r.name, p, 'permissions')}
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-lg transition-all cursor-pointer ${
                            r.permissions.includes(p)
                              ? 'bg-green-500/15 text-green-600 dark:text-green-400 hover:bg-red-500/15 hover:text-red-500'
                              : 'bg-fd-accent/60 text-fd-muted-foreground/30 hover:bg-green-500/10 hover:text-green-600'
                          }`}>
                          {r.permissions.includes(p)
                            ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
                {allActions.length > 0 && (
                  <tr className="border-t-2 border-fd-border">
                    <td className="sticky left-0 z-10 bg-fd-card px-4 py-1.5 text-xs font-semibold text-fd-muted-foreground uppercase tracking-wider" colSpan={1}>Actions</td>
                    {roles.map(r => <td key={r.name} />)}
                  </tr>
                )}
                {allActions.map(a => (
                  <tr key={a} className="hover:bg-fd-accent/20 transition-colors cursor-pointer">
                    <td className="sticky left-0 z-10 bg-fd-card px-4 py-2 text-xs font-mono">{a}</td>
                    {roles.map(r => (
                      <td key={r.name} className="px-3 py-2 text-center">
                        <button onClick={() => toggleMatrixCell(r.name, a, 'actions')}
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-lg transition-all cursor-pointer ${
                            r.actions.includes(a)
                              ? 'bg-green-500/15 text-green-600 dark:text-green-400 hover:bg-red-500/15 hover:text-red-500'
                              : 'bg-fd-accent/60 text-fd-muted-foreground/30 hover:bg-green-500/10 hover:text-green-600'
                          }`}>
                          {r.actions.includes(a)
                            ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>}
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

      {/* Edit Role Modal */}
      {currentEditRole && (
        <div className="not-prose fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingRole(null)} />
          <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border border-fd-border bg-fd-card shadow-2xl [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-fd-border">
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-fd-border bg-fd-card px-6 py-4">
              <button
                onClick={() => setEditingRole(null)}
                className="absolute right-4 top-4 rounded-md p-1 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
              <div className="flex items-center gap-3 pr-8">
                <div className={`h-3 w-3 rounded-full ${currentEditRole.color}`} />
                <div>
                  <h3 className="text-base font-semibold text-fd-foreground">Edit Role</h3>
                  <p className="text-xs text-fd-muted-foreground">
                    {currentEditRole.userCount > 0
                      ? <>{currentEditRole.userCount.toLocaleString()} user{currentEditRole.userCount !== 1 ? 's' : ''} assigned</>
                      : <>No users assigned yet</>
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Name & Description */}
            <div className="p-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-fd-foreground">Role Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onBlur={saveEdit}
                  className="h-9 w-full rounded-lg border border-fd-border bg-fd-background px-3 text-sm font-semibold text-fd-foreground placeholder:text-fd-muted-foreground outline-none transition-colors focus-visible:border-fd-ring focus-visible:ring-3 focus-visible:ring-fd-ring/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-fd-foreground">Description</label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  onBlur={saveEdit}
                  placeholder="Brief role description..."
                  className="h-9 w-full rounded-lg border border-fd-border bg-fd-background px-3 text-sm text-fd-foreground placeholder:text-fd-muted-foreground outline-none transition-colors focus-visible:border-fd-ring focus-visible:ring-3 focus-visible:ring-fd-ring/50"
                />
              </div>

              {/* Permissions */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span className="text-sm font-medium text-fd-foreground">Permissions</span>
                  <span className="rounded-lg bg-fd-accent px-1.5 py-0.5 text-xs font-medium tabular-nums text-fd-muted-foreground">{currentEditRole.permissions.length}</span>
                </div>
                <EditableChipList
                  items={currentEditRole.permissions}
                  allItems={availablePermissions}
                  onAdd={p => updateRole(currentEditRole.name, r => ({ ...r, permissions: [...r.permissions, p] }))}
                  onRemove={p => updateRole(currentEditRole.name, r => ({ ...r, permissions: r.permissions.filter(x => x !== p) }))}
                  emptyText="No permissions -- this role cannot access any data"
                  accentColor="blue"
                />
              </div>

              {/* Actions */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                  <span className="text-sm font-medium text-fd-foreground">Actions</span>
                  <span className="rounded-lg bg-fd-accent px-1.5 py-0.5 text-xs font-medium tabular-nums text-fd-muted-foreground">{currentEditRole.actions.length}</span>
                </div>
                <EditableChipList
                  items={currentEditRole.actions}
                  allItems={availableActions}
                  onAdd={a => updateRole(currentEditRole.name, r => ({ ...r, actions: [...r.actions, a] }))}
                  onRemove={a => updateRole(currentEditRole.name, r => ({ ...r, actions: r.actions.filter(x => x !== a) }))}
                  emptyText="No actions -- this role cannot call server functions"
                  accentColor="amber"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-fd-border pt-4">
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-600 dark:text-red-400">Delete this role?</span>
                  <button onClick={() => removeRole(currentEditRole.name)}
                    className="inline-flex h-8 items-center rounded-lg bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700">Yes, delete</button>
                  <button onClick={() => setConfirmDelete(false)}
                    className="inline-flex h-8 items-center rounded-lg px-3 text-xs text-fd-muted-foreground hover:text-fd-foreground">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)}
                  className="text-xs text-fd-muted-foreground transition-colors hover:text-red-600 dark:hover:text-red-400">
                  Delete role
                </button>
              )}
              <button
                onClick={() => setEditingRole(null)}
                className="inline-flex h-8 items-center rounded-lg border border-fd-border bg-fd-background px-3 text-xs font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
              >
                Done
              </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
