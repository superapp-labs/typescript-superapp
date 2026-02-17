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

function formatValue(value: number, unit: string): string {
  if (unit === 'ms') return `${(value / 1000).toFixed(0)}s`
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`
  return String(value)
}

function getLevel(key: string, value: number): 'low' | 'medium' | 'high' {
  const thresholds: Record<string, [number, number]> = {
    maxRows: [1000, 50000],
    maxRelationDepth: [2, 5],
    maxFilterNesting: [3, 10],
    maxFilterConditions: [10, 50],
    queryTimeout: [5000, 60000],
    rateLimitPerUser: [50, 500],
    rateLimitPerIP: [100, 1000],
  }
  const [low, high] = thresholds[key] ?? [0, 0]
  if (value <= low) return 'low'
  if (value >= high) return 'high'
  return 'medium'
}

const levelStyles = {
  low: 'text-green-600 dark:text-green-400',
  medium: 'text-amber-600 dark:text-amber-400',
  high: 'text-red-600 dark:text-red-400',
}
const levelLabels = { low: 'Strict', medium: 'Balanced', high: 'Permissive' }

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

  return (
    <div className="not-prose rounded-xl border border-fd-border bg-fd-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-fd-border px-4 py-3">
        <span className="text-sm font-medium text-fd-foreground">Rate Limits & Query Constraints</span>
        <div className="flex gap-1">
          {(['strict', 'balanced', 'permissive'] as const).map(p => (
            <button
              key={p}
              onClick={() => applyPreset(p)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                preset === p
                  ? 'bg-fd-primary text-fd-primary-foreground'
                  : 'text-fd-muted-foreground hover:bg-fd-accent'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-fd-border">
        {limits.map(limit => {
          const level = getLevel(limit.key, limit.value)
          const pct = ((limit.value - limit.min) / (limit.max - limit.min)) * 100
          return (
            <div key={limit.key} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-fd-foreground">{limit.label}</span>
                  <p className="text-xs text-fd-muted-foreground">{limit.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-semibold text-fd-foreground">{formatValue(limit.value, limit.unit)}</span>
                  <span className="ml-1 text-xs text-fd-muted-foreground">{limit.unit !== 'ms' ? limit.unit : ''}</span>
                  <div className={`text-xs font-medium ${levelStyles[level]}`}>{levelLabels[level]}</div>
                </div>
              </div>
              <div className="relative mt-2">
                <div className="h-1.5 rounded-full bg-fd-accent">
                  <div
                    className={`h-full rounded-full transition-all ${
                      level === 'low' ? 'bg-green-500' : level === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={limit.min}
                  max={limit.max}
                  step={limit.step}
                  value={limit.value}
                  onChange={e => updateLimit(limit.key, Number(e.target.value))}
                  className="absolute inset-0 h-1.5 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-fd-foreground [&::-webkit-slider-thumb]:shadow-sm"
                />
              </div>
              <div className="mt-0.5 flex justify-between text-xs text-fd-muted-foreground">
                <span>{formatValue(limit.min, limit.unit)}</span>
                <span>{formatValue(limit.max, limit.unit)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
