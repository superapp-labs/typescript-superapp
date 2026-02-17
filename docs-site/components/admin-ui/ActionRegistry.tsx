'use client'

import { useState } from 'react'

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
  const [selected, setSelected] = useState<string>('incrementStock')
  const [testMode, setTestMode] = useState(false)
  const [testValues, setTestValues] = useState<Record<string, string>>({})
  const [testResult, setTestResult] = useState<string | null>(null)

  const action = mockActions.find(a => a.name === selected)!

  const runTest = () => {
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
    <div className="not-prose rounded-xl border border-fd-border bg-fd-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-fd-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-fd-foreground">Actions</span>
          <span className="rounded-full bg-fd-accent px-2 py-0.5 text-xs text-fd-muted-foreground">{mockActions.length} registered</span>
        </div>
      </div>

      <div className="flex min-h-[360px]">
        {/* List */}
        <div className="w-52 shrink-0 border-r border-fd-border bg-fd-accent/30">
          {mockActions.map(a => (
            <button
              key={a.name}
              onClick={() => { setSelected(a.name); setTestMode(false); setTestResult(null); setTestValues({}) }}
              className={`flex w-full items-start gap-2 border-b border-fd-border px-3 py-2.5 text-left transition-colors ${
                selected === a.name ? 'bg-fd-primary/10 border-l-2 border-l-fd-primary' : 'hover:bg-fd-accent/50'
              }`}
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

        {/* Detail */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-mono font-semibold text-fd-foreground">{action.name}</h4>
              <p className="mt-0.5 text-xs text-fd-muted-foreground">{action.description}</p>
            </div>
            <button
              onClick={() => { setTestMode(!testMode); setTestResult(null) }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                testMode
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : 'bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/80'
              }`}
            >
              {testMode ? 'Close Playground' : 'Test'}
            </button>
          </div>

          {/* Roles */}
          <div className="mt-3">
            <span className="text-xs text-fd-muted-foreground uppercase tracking-wide">Allowed Roles</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {action.roles.map(role => (
                <span key={role} className="rounded-full border border-fd-primary/30 bg-fd-primary/10 px-2 py-0.5 text-xs font-medium text-fd-primary">
                  {role}
                </span>
              ))}
            </div>
          </div>

          {/* Schema */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-md border border-fd-border p-3">
              <span className="text-xs text-fd-muted-foreground uppercase tracking-wide">Input Schema</span>
              <div className="mt-1.5 space-y-1">
                {action.inputFields.map(f => (
                  <div key={f.name} className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="text-fd-foreground">{f.name}</span>
                    {f.required && <span className="text-red-500">*</span>}
                    <span className={getTypeColor(f.type)}>{f.type}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-fd-border p-3">
              <span className="text-xs text-fd-muted-foreground uppercase tracking-wide">Output Schema</span>
              <div className="mt-1.5 space-y-1">
                {action.outputFields.map(f => (
                  <div key={f.name} className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="text-fd-foreground">{f.name}</span>
                    <span className={getTypeColor(f.type)}>{f.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Test Playground */}
          {testMode && (
            <div className="mt-3 rounded-md border border-amber-500/20 bg-amber-500/5 p-3">
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Playground</span>
              <div className="mt-2 space-y-2">
                {action.inputFields.map(f => (
                  <div key={f.name} className="flex items-center gap-2">
                    <label className="w-28 text-right text-xs font-mono text-fd-muted-foreground">{f.name}</label>
                    <input
                      type="text"
                      placeholder={f.type}
                      value={testValues[f.name] ?? ''}
                      onChange={e => setTestValues({ ...testValues, [f.name]: e.target.value })}
                      className="min-w-0 flex-1 rounded border border-fd-border bg-fd-background px-2 py-1 text-xs font-mono text-fd-foreground placeholder:text-fd-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                ))}
                <div className="flex justify-end">
                  <button
                    onClick={runTest}
                    className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-700"
                  >
                    Execute
                  </button>
                </div>
              </div>
              {testResult && (
                <div className="mt-2">
                  <span className="text-xs text-fd-muted-foreground uppercase tracking-wide">Response</span>
                  <pre className="mt-1 rounded bg-fd-background p-2 text-xs font-mono text-green-600 dark:text-green-400">{testResult}</pre>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="mt-3 flex gap-4">
            <div className="rounded-md bg-fd-accent/50 px-3 py-2">
              <div className="text-xs text-fd-muted-foreground">Total Calls</div>
              <div className="text-sm font-semibold text-fd-foreground">{action.callCount.toLocaleString()}</div>
            </div>
            <div className="rounded-md bg-fd-accent/50 px-3 py-2">
              <div className="text-xs text-fd-muted-foreground">Avg Duration</div>
              <div className="text-sm font-semibold text-fd-foreground">{action.avgDuration}ms</div>
            </div>
            <div className="rounded-md bg-fd-accent/50 px-3 py-2">
              <div className="text-xs text-fd-muted-foreground">Endpoint</div>
              <div className="text-xs font-mono text-fd-foreground">POST /actions/{action.name}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
