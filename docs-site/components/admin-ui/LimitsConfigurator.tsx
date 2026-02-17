'use client'

import { useState } from 'react'

interface LimitConfig {
  key: string
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  description: string
}

const defaultLimits: LimitConfig[] = [
  { key: 'maxRows', label: 'Max Rows', value: 10000, min: 100, max: 100000, step: 100, unit: 'rows', description: 'Maximum rows a single query can return' },
  { key: 'maxRelationDepth', label: 'Relation Depth', value: 3, min: 1, max: 10, step: 1, unit: 'levels', description: 'Maximum depth for nested relation queries' },
  { key: 'maxFilterNesting', label: 'Filter Nesting', value: 5, min: 1, max: 20, step: 1, unit: 'levels', description: 'Maximum nesting depth for $and/$or/$not operators' },
  { key: 'maxFilterConditions', label: 'Filter Conditions', value: 20, min: 1, max: 100, step: 1, unit: 'conditions', description: 'Maximum total filter conditions per query' },
  { key: 'queryTimeout', label: 'Query Timeout', value: 30000, min: 1000, max: 120000, step: 1000, unit: 'ms', description: 'Kill queries that exceed this duration' },
  { key: 'rateLimitPerUser', label: 'Rate Limit / User', value: 200, min: 10, max: 2000, step: 10, unit: 'req/min', description: 'Maximum requests per minute per authenticated user' },
  { key: 'rateLimitPerIP', label: 'Rate Limit / IP', value: 500, min: 10, max: 5000, step: 10, unit: 'req/min', description: 'Maximum requests per minute per IP address' },
]

const queryLimitKeys = ['maxRows', 'maxRelationDepth', 'maxFilterNesting', 'maxFilterConditions', 'queryTimeout']
const rateLimitKeys = ['rateLimitPerUser', 'rateLimitPerIP']

function LimitRow({
  limit,
  onUpdate,
}: {
  limit: LimitConfig
  onUpdate: (key: string, value: number) => void
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (raw === '') return
    const num = Number(raw)
    if (!Number.isNaN(num)) {
      const clamped = Math.min(limit.max, Math.max(limit.min, num))
      onUpdate(limit.key, clamped)
    }
  }

  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div className="flex-1 min-w-0">
        <label className="text-sm font-medium text-fd-foreground">{limit.label}</label>
        <p className="text-xs text-fd-muted-foreground mt-0.5">{limit.description}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <input
          type="number"
          min={limit.min}
          max={limit.max}
          step={limit.step}
          value={limit.value}
          onChange={handleChange}
          className="h-9 w-24 rounded-lg border border-fd-border bg-fd-background px-3 text-sm text-fd-foreground outline-none transition-colors focus-visible:border-fd-ring focus-visible:ring-3 focus-visible:ring-fd-ring/50 font-mono tabular-nums text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-xs text-fd-muted-foreground w-12">{limit.unit}</span>
      </div>
    </div>
  )
}

export function LimitsConfigurator() {
  const [limits, setLimits] = useState<LimitConfig[]>(defaultLimits)
  const [preset, setPreset] = useState<'strict' | 'balanced' | 'permissive' | 'custom'>('balanced')

  const applyPreset = (name: 'strict' | 'balanced' | 'permissive') => {
    const presets: Record<string, Record<string, number>> = {
      strict: { maxRows: 1000, maxRelationDepth: 2, maxFilterNesting: 3, maxFilterConditions: 10, queryTimeout: 5000, rateLimitPerUser: 50, rateLimitPerIP: 100 },
      balanced: { maxRows: 10000, maxRelationDepth: 3, maxFilterNesting: 5, maxFilterConditions: 20, queryTimeout: 30000, rateLimitPerUser: 200, rateLimitPerIP: 500 },
      permissive: { maxRows: 50000, maxRelationDepth: 6, maxFilterNesting: 10, maxFilterConditions: 50, queryTimeout: 60000, rateLimitPerUser: 1000, rateLimitPerIP: 2000 },
    }
    setLimits(prev => prev.map(l => ({ ...l, value: presets[name][l.key] ?? l.value })))
    setPreset(name)
  }

  const updateLimit = (key: string, value: number) => {
    setLimits(prev => prev.map(l => l.key === key ? { ...l, value } : l))
    setPreset('custom')
  }

  const queryLimits = limits.filter(l => queryLimitKeys.includes(l.key))
  const rateLimits = limits.filter(l => rateLimitKeys.includes(l.key))

  return (
    <div className="not-prose rounded-xl border border-fd-border overflow-hidden">
      <div className="flex items-center justify-between border-b border-fd-border px-4 py-3">
        <span className="text-sm font-medium text-fd-foreground">Rate Limits & Query Constraints</span>
        <div className="flex gap-1">
          {(['strict', 'balanced', 'permissive'] as const).map(p => (
            <button
              key={p}
              onClick={() => applyPreset(p)}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-2.5 text-sm font-medium transition-colors h-8 capitalize ${
                preset === p
                  ? 'border-transparent bg-fd-primary text-fd-primary-foreground'
                  : 'border-fd-border bg-fd-background text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="mb-1">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground">Query Limits</h4>
        </div>
        <div className="divide-y divide-fd-border">
          {queryLimits.map(limit => (
            <LimitRow key={limit.key} limit={limit} onUpdate={updateLimit} />
          ))}
        </div>
      </div>

      <div className="border-t border-fd-border px-4 py-3">
        <div className="mb-1">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground">Rate Limits</h4>
        </div>
        <div className="divide-y divide-fd-border">
          {rateLimits.map(limit => (
            <LimitRow key={limit.key} limit={limit} onUpdate={updateLimit} />
          ))}
        </div>
      </div>
    </div>
  )
}
