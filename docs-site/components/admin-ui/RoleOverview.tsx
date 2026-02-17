'use client'

import { useState } from 'react'

interface RoleConfig {
  name: string
  permissions: string[]
  actions: string[]
  userCount: number
  color: string
}

const initialRoles: RoleConfig[] = [
  { name: 'admin', permissions: ['read_orders', 'manage_orders', 'read_users', 'manage_users', 'read_products', 'manage_products'], actions: ['incrementStock', 'resetStock', 'inviteMember', 'revenueReport'], userCount: 3, color: 'bg-red-500' },
  { name: 'manager', permissions: ['read_orders', 'manage_orders', 'read_products'], actions: ['incrementStock'], userCount: 8, color: 'bg-amber-500' },
  { name: 'editor', permissions: ['read_orders', 'read_products', 'manage_products'], actions: [], userCount: 15, color: 'bg-blue-500' },
  { name: 'viewer', permissions: ['read_orders', 'read_products'], actions: ['revenueReport'], userCount: 42, color: 'bg-green-500' },
  { name: 'customer', permissions: ['read_orders'], actions: ['applyDiscount'], userCount: 1284, color: 'bg-purple-500' },
]

export function RoleOverview() {
  const [roles] = useState(initialRoles)
  const [selected, setSelected] = useState<string | null>(null)
  const [view, setView] = useState<'grid' | 'matrix'>('grid')

  const allPermissions = [...new Set(roles.flatMap(r => r.permissions))]
  const allActions = [...new Set(roles.flatMap(r => r.actions))]

  return (
    <div className="not-prose rounded-xl border border-fd-border bg-fd-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-fd-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-fd-foreground">Roles & Access</span>
          <span className="rounded-full bg-fd-accent px-2 py-0.5 text-xs text-fd-muted-foreground">{roles.length} roles</span>
        </div>
        <div className="flex gap-1 rounded-lg bg-fd-accent p-0.5">
          <button
            onClick={() => setView('grid')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${view === 'grid' ? 'bg-fd-background text-fd-foreground shadow-sm' : 'text-fd-muted-foreground'}`}
          >
            Cards
          </button>
          <button
            onClick={() => setView('matrix')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${view === 'matrix' ? 'bg-fd-background text-fd-foreground shadow-sm' : 'text-fd-muted-foreground'}`}
          >
            Matrix
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {roles.map(role => (
              <button
                key={role.name}
                onClick={() => setSelected(selected === role.name ? null : role.name)}
                className={`rounded-lg border p-3 text-left transition-all ${
                  selected === role.name
                    ? 'border-fd-primary bg-fd-primary/5 ring-1 ring-fd-primary'
                    : 'border-fd-border hover:border-fd-primary/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${role.color}`} />
                  <span className="text-xs font-semibold text-fd-foreground">{role.name}</span>
                </div>
                <div className="mt-2 space-y-1 text-[10px] text-fd-muted-foreground">
                  <div>{role.permissions.length} permissions</div>
                  <div>{role.actions.length} actions</div>
                  <div>{role.userCount} users</div>
                </div>
              </button>
            ))}
          </div>

          {selected && (
            <div className="mt-4 rounded-lg border border-fd-primary/20 bg-fd-primary/5 p-4">
              <h4 className="text-xs font-semibold text-fd-foreground capitalize">{selected} role details</h4>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wide">Permissions</span>
                  <div className="mt-1 space-y-0.5">
                    {roles.find(r => r.name === selected)!.permissions.map(p => (
                      <div key={p} className="text-[11px] font-mono text-fd-foreground">{p}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wide">Actions</span>
                  <div className="mt-1 space-y-0.5">
                    {roles.find(r => r.name === selected)!.actions.length > 0 ? (
                      roles.find(r => r.name === selected)!.actions.map(a => (
                        <div key={a} className="text-[11px] font-mono text-fd-foreground">{a}</div>
                      ))
                    ) : (
                      <div className="text-[11px] text-fd-muted-foreground italic">No actions assigned</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-fd-border bg-fd-accent/30">
                <th className="sticky left-0 bg-fd-accent/30 px-3 py-2 text-left text-[10px] font-medium text-fd-muted-foreground uppercase tracking-wide">Access</th>
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
              {allPermissions.map(p => (
                <tr key={p} className="hover:bg-fd-accent/20">
                  <td className="sticky left-0 bg-fd-card px-3 py-1.5 font-mono text-[11px] text-fd-foreground">{p}</td>
                  {roles.map(r => (
                    <td key={r.name} className="px-3 py-1.5 text-center">
                      {r.permissions.includes(p) ? (
                        <span className="inline-block h-4 w-4 rounded bg-green-500/20 text-green-600 dark:text-green-400 text-[11px] leading-4">&#10003;</span>
                      ) : (
                        <span className="inline-block h-4 w-4 rounded bg-fd-accent text-fd-muted-foreground/30 text-[11px] leading-4">&mdash;</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t-2 border-fd-border">
                <td className="sticky left-0 bg-fd-card px-3 py-1.5 text-[10px] text-fd-muted-foreground uppercase tracking-wide" colSpan={1}>Actions</td>
                <td colSpan={roles.length} />
              </tr>
              {allActions.map(a => (
                <tr key={a} className="hover:bg-fd-accent/20">
                  <td className="sticky left-0 bg-fd-card px-3 py-1.5 font-mono text-[11px] text-fd-foreground">{a}</td>
                  {roles.map(r => (
                    <td key={r.name} className="px-3 py-1.5 text-center">
                      {r.actions.includes(a) ? (
                        <span className="inline-block h-4 w-4 rounded bg-green-500/20 text-green-600 dark:text-green-400 text-[11px] leading-4">&#10003;</span>
                      ) : (
                        <span className="inline-block h-4 w-4 rounded bg-fd-accent text-fd-muted-foreground/30 text-[11px] leading-4">&mdash;</span>
                      )}
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
