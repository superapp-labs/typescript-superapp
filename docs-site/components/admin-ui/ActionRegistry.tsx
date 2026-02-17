'use client'

import { useState, useEffect, useCallback } from 'react'

interface ActionDef {
  name: string
  roles: string[]
  inputFields: { name: string; type: string; required: boolean }[]
  outputFields: { name: string; type: string }[]
  description: string
  callCount: number
  avgDuration: number
}

const mockActions: ActionDef[] = [
  {
    name: 'incrementStock',
    roles: ['warehouse_manager', 'admin'],
    inputFields: [
      { name: 'productId', type: 'string', required: true },
      { name: 'amount', type: 'number', required: true },
    ],
    outputFields: [
      { name: 'id', type: 'string' },
      { name: 'stock', type: 'number' },
    ],
    description: 'Atomically increase product stock count',
    callCount: 1284,
    avgDuration: 8,
  },
  {
    name: 'transfer',
    roles: ['account_holder'],
    inputFields: [
      { name: 'fromAccountId', type: 'string', required: true },
      { name: 'toAccountId', type: 'string', required: true },
      { name: 'amount', type: 'number', required: true },
    ],
    outputFields: [
      { name: 'id', type: 'string' },
      { name: 'fromAccountId', type: 'string' },
      { name: 'toAccountId', type: 'string' },
      { name: 'amount', type: 'number' },
      { name: 'timestamp', type: 'string' },
    ],
    description: 'Transfer balance between accounts in a transaction',
    callCount: 523,
    avgDuration: 45,
  },
  {
    name: 'applyDiscount',
    roles: ['customer'],
    inputFields: [
      { name: 'orderId', type: 'string', required: true },
      { name: 'code', type: 'string', required: true },
    ],
    outputFields: [
      { name: 'discountAmount', type: 'number' },
      { name: 'newTotal', type: 'number' },
    ],
    description: 'Validate and apply a discount code to an order',
    callCount: 891,
    avgDuration: 22,
  },
  {
    name: 'inviteMember',
    roles: ['admin', 'owner'],
    inputFields: [
      { name: 'email', type: 'string', required: true },
      { name: 'role', type: "'viewer' | 'editor' | 'admin'", required: true },
    ],
    outputFields: [
      { name: 'memberId', type: 'string' },
      { name: 'status', type: "'invited'" },
    ],
    description: 'Invite a new member to the organization with email notification',
    callCount: 67,
    avgDuration: 120,
  },
  {
    name: 'revenueReport',
    roles: ['analyst', 'admin', 'owner'],
    inputFields: [
      { name: 'startDate', type: 'string (date)', required: true },
      { name: 'endDate', type: 'string (date)', required: true },
    ],
    outputFields: [
      { name: 'month', type: 'string' },
      { name: 'totalRevenue', type: 'number' },
      { name: 'orderCount', type: 'number' },
      { name: 'avgOrderValue', type: 'number' },
    ],
    description: 'Generate monthly revenue report with aggregations',
    callCount: 34,
    avgDuration: 350,
  },
]

const typeColors: Record<string, string> = {
  string: 'text-green-600 dark:text-green-400',
  number: 'text-blue-600 dark:text-blue-400',
  boolean: 'text-purple-600 dark:text-purple-400',
}

function getTypeColor(type: string): string {
  if (type.includes('string')) return typeColors.string
  if (type.includes('number')) return typeColors.number
  if (type.includes('boolean')) return typeColors.boolean
  return 'text-fd-foreground'
}

export function ActionRegistry() {
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [testValues, setTestValues] = useState<Record<string, string>>({})
  const [testResult, setTestResult] = useState<string | null>(null)

  const action = selectedName ? mockActions.find(a => a.name === selectedName) ?? null : null

  const closeModal = useCallback(() => {
    setSelectedName(null)
    setTestValues({})
    setTestResult(null)
  }, [])

  // Close on Escape
  useEffect(() => {
    if (!selectedName) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [selectedName, closeModal])

  const runTest = () => {
    if (!action) return
    setTestResult(null)
    setTimeout(() => {
      const output: Record<string, unknown> = {}
      action.outputFields.forEach(f => {
        if (f.type.includes('number')) output[f.name] = Math.floor(Math.random() * 1000)
        else if (f.type.includes("'")) output[f.name] = f.type.replace(/'/g, '').split(' | ')[0]
        else output[f.name] = `${f.name}_${Math.random().toString(36).slice(2, 8)}`
      })
      setTestResult(JSON.stringify(output, null, 2))
    }, 800)
  }

  return (
    <>
      {/* Action List Card */}
      <div className="not-prose rounded-xl border border-fd-border overflow-hidden">
        <div className="flex items-center justify-between border-b border-fd-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-fd-foreground">Actions</span>
            <span className="rounded-full bg-fd-accent px-2 py-0.5 text-xs text-fd-muted-foreground">
              {mockActions.length} registered
            </span>
          </div>
        </div>

        <div className="divide-y divide-fd-border">
          {mockActions.map(a => (
            <button
              key={a.name}
              onClick={() => {
                setSelectedName(a.name)
                setTestValues({})
                setTestResult(null)
              }}
              className="flex w-full items-start gap-2 px-4 py-3 text-left transition-colors cursor-pointer hover:bg-fd-accent/50"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-mono font-medium text-fd-foreground">{a.name}</div>
                <div className="mt-0.5 truncate text-xs text-fd-muted-foreground">{a.description}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-fd-muted-foreground">
                  <span>{a.callCount.toLocaleString()} calls</span>
                  <span className="text-fd-border">|</span>
                  <span>~{a.avgDuration}ms</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {action && (
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
              <div className="flex items-center gap-3 pr-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10">
                  <svg className="h-5 w-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold font-mono text-fd-foreground">{action.name}</h3>
                  <p className="text-xs text-fd-muted-foreground">{action.description}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-5 p-6">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-fd-border bg-fd-accent/30 px-3 py-2.5">
                  <div className="text-[11px] uppercase tracking-wide text-fd-muted-foreground font-medium">Total Calls</div>
                  <div className="mt-0.5 text-sm font-semibold tabular-nums text-fd-foreground">{action.callCount.toLocaleString()}</div>
                </div>
                <div className="rounded-lg border border-fd-border bg-fd-accent/30 px-3 py-2.5">
                  <div className="text-[11px] uppercase tracking-wide text-fd-muted-foreground font-medium">Avg Duration</div>
                  <div className="mt-0.5 text-sm font-semibold tabular-nums text-fd-foreground">{action.avgDuration}ms</div>
                </div>
                <div className="rounded-lg border border-fd-border bg-fd-accent/30 px-3 py-2.5">
                  <div className="text-[11px] uppercase tracking-wide text-fd-muted-foreground font-medium">Endpoint</div>
                  <div className="mt-0.5 text-xs font-mono text-fd-foreground truncate">POST /actions/{action.name}</div>
                </div>
              </div>

              {/* Allowed Roles */}
              <div>
                <span className="text-[11px] font-medium text-fd-muted-foreground uppercase tracking-wide">Allowed Roles</span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {action.roles.map(role => (
                    <span
                      key={role}
                      className="rounded-full border border-fd-primary/30 bg-fd-primary/10 px-2.5 py-0.5 text-xs font-medium text-fd-primary"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Input / Output Schema */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-fd-border p-3">
                  <span className="text-[11px] font-medium text-fd-muted-foreground uppercase tracking-wide">Input Schema</span>
                  <div className="mt-2 space-y-1.5">
                    {action.inputFields.map(f => (
                      <div key={f.name} className="flex items-center gap-1.5 text-xs font-mono">
                        <span className="text-fd-foreground">{f.name}</span>
                        {f.required && <span className="text-red-500">*</span>}
                        <span className={`ml-auto ${getTypeColor(f.type)}`}>{f.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-fd-border p-3">
                  <span className="text-[11px] font-medium text-fd-muted-foreground uppercase tracking-wide">Output Schema</span>
                  <div className="mt-2 space-y-1.5">
                    {action.outputFields.map(f => (
                      <div key={f.name} className="flex items-center gap-1.5 text-xs font-mono">
                        <span className="text-fd-foreground">{f.name}</span>
                        <span className={`ml-auto ${getTypeColor(f.type)}`}>{f.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Test Playground */}
              <div className="rounded-lg border border-fd-border overflow-hidden">
                <div className="flex items-center justify-between border-b border-fd-border bg-fd-accent/30 px-4 py-2.5">
                  <span className="text-xs font-medium text-fd-foreground">Playground</span>
                  <span className="text-[10px] uppercase tracking-wider text-fd-muted-foreground">Test this action</span>
                </div>
                <div className="p-4 space-y-3">
                  {action.inputFields.map(f => (
                    <div key={f.name}>
                      <label className="mb-1 block text-xs font-medium text-fd-muted-foreground">
                        {f.name} {f.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        placeholder={f.type}
                        value={testValues[f.name] ?? ''}
                        onChange={e => setTestValues({ ...testValues, [f.name]: e.target.value })}
                        className="h-9 w-full rounded-lg border border-fd-border bg-fd-background px-3 text-sm font-mono text-fd-foreground outline-none transition-colors placeholder:text-fd-muted-foreground/50 focus-visible:border-fd-ring focus-visible:ring-3 focus-visible:ring-fd-ring/50"
                      />
                    </div>
                  ))}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={runTest}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-fd-primary px-3 text-xs font-medium text-fd-primary-foreground transition-all hover:bg-fd-primary/90 active:scale-[0.97]"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      Execute
                    </button>
                  </div>
                  {testResult && (
                    <div>
                      <span className="text-[11px] font-medium text-fd-muted-foreground uppercase tracking-wide">Response</span>
                      <pre className="mt-1.5 rounded-lg border border-fd-border bg-fd-background p-3 text-xs font-mono text-green-600 dark:text-green-400 leading-relaxed">{testResult}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
