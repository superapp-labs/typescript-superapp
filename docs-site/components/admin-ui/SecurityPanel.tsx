'use client'

import { useState } from 'react'

interface AuditSettings {
  enabled: boolean
  logQuery: boolean
  logParams: boolean
  logDuration: boolean
  retention: string
}

export function SecurityPanel() {
  const [algorithms, setAlgorithms] = useState(['RS256', 'ES256'])
  const [issuer, setIssuer] = useState('https://auth.myapp.com')
  const [audience, setAudience] = useState('https://api.myapp.com')
  const [clockSkew, setClockSkew] = useState(30)
  const [corsOrigins, setCorsOrigins] = useState(['https://myapp.com', 'https://admin.myapp.com'])
  const [corsCredentials, setCorsCredentials] = useState(true)
  const [newOrigin, setNewOrigin] = useState('')
  const [audit, setAudit] = useState<AuditSettings>({
    enabled: true,
    logQuery: true,
    logParams: true,
    logDuration: true,
    retention: '90d',
  })

  const allAlgorithms = ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'HS256', 'HS384', 'HS512']
  const retentionOptions = ['7d', '30d', '90d', '180d', '365d', '1y']

  const toggleAlgorithm = (alg: string) => {
    setAlgorithms(prev =>
      prev.includes(alg) ? prev.filter(a => a !== alg) : [...prev, alg]
    )
  }

  const addOrigin = () => {
    if (!newOrigin) return
    setCorsOrigins([...corsOrigins, newOrigin])
    setNewOrigin('')
  }

  const removeOrigin = (origin: string) => {
    setCorsOrigins(corsOrigins.filter(o => o !== origin))
  }

  return (
    <div className="not-prose space-y-4">
      {/* JWT */}
      <div className="rounded-xl border border-fd-border bg-fd-card overflow-hidden">
        <div className="border-b border-fd-border px-4 py-3">
          <span className="text-sm font-medium text-fd-foreground">JWT Validation</span>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wide">Allowed Algorithms</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {allAlgorithms.map(alg => (
                <button
                  key={alg}
                  onClick={() => toggleAlgorithm(alg)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-mono font-medium transition-colors ${
                    algorithms.includes(alg)
                      ? 'border-fd-primary bg-fd-primary/10 text-fd-primary'
                      : 'border-fd-border text-fd-muted-foreground hover:border-fd-primary/50'
                  }`}
                >
                  {alg}
                </button>
              ))}
            </div>
            {algorithms.some(a => a.startsWith('HS')) && (
              <p className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                Warning: HMAC algorithms (HS*) use symmetric keys. Use RS/ES for production.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-fd-muted-foreground uppercase tracking-wide">Issuer</label>
              <input
                type="text"
                value={issuer}
                onChange={e => setIssuer(e.target.value)}
                className="mt-1 w-full rounded-lg border border-fd-border bg-fd-background px-3 py-1.5 text-xs font-mono text-fd-foreground focus:outline-none focus:ring-2 focus:ring-fd-primary"
              />
            </div>
            <div>
              <label className="text-[10px] text-fd-muted-foreground uppercase tracking-wide">Audience</label>
              <input
                type="text"
                value={audience}
                onChange={e => setAudience(e.target.value)}
                className="mt-1 w-full rounded-lg border border-fd-border bg-fd-background px-3 py-1.5 text-xs font-mono text-fd-foreground focus:outline-none focus:ring-2 focus:ring-fd-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-fd-muted-foreground uppercase tracking-wide">Clock Skew Tolerance</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={300}
                step={5}
                value={clockSkew}
                onChange={e => setClockSkew(Number(e.target.value))}
                className="flex-1 h-1.5 appearance-none rounded-full bg-fd-accent [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-fd-foreground"
              />
              <span className="w-14 text-right text-xs font-mono text-fd-foreground">{clockSkew}s</span>
            </div>
          </div>
        </div>
      </div>

      {/* CORS */}
      <div className="rounded-xl border border-fd-border bg-fd-card overflow-hidden">
        <div className="border-b border-fd-border px-4 py-3">
          <span className="text-sm font-medium text-fd-foreground">CORS</span>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wide">Allowed Origins</span>
            </div>
            <div className="mt-1.5 space-y-1.5">
              {corsOrigins.map(origin => (
                <div key={origin} className="flex items-center justify-between rounded-lg border border-fd-border bg-fd-background px-3 py-1.5">
                  <span className="text-xs font-mono text-fd-foreground">{origin}</span>
                  <button
                    onClick={() => removeOrigin(origin)}
                    className="text-fd-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={newOrigin}
                  onChange={e => setNewOrigin(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addOrigin()}
                  className="min-w-0 flex-1 rounded-lg border border-fd-border bg-fd-background px-3 py-1.5 text-xs font-mono text-fd-foreground placeholder:text-fd-muted-foreground focus:outline-none focus:ring-2 focus:ring-fd-primary"
                />
                <button
                  onClick={addOrigin}
                  className="rounded-lg bg-fd-primary px-3 py-1.5 text-xs font-medium text-fd-primary-foreground hover:opacity-90"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-fd-foreground">Allow Credentials</span>
              <p className="text-[10px] text-fd-muted-foreground">Send cookies and auth headers in cross-origin requests</p>
            </div>
            <button
              onClick={() => setCorsCredentials(!corsCredentials)}
              className={`relative h-5 w-9 rounded-full transition-colors ${corsCredentials ? 'bg-fd-primary' : 'bg-fd-accent'}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${corsCredentials ? 'left-[18px]' : 'left-0.5'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Audit */}
      <div className="rounded-xl border border-fd-border bg-fd-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-fd-border px-4 py-3">
          <span className="text-sm font-medium text-fd-foreground">Audit Logging</span>
          <button
            onClick={() => setAudit({ ...audit, enabled: !audit.enabled })}
            className={`relative h-5 w-9 rounded-full transition-colors ${audit.enabled ? 'bg-green-500' : 'bg-fd-accent'}`}
          >
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${audit.enabled ? 'left-[18px]' : 'left-0.5'}`} />
          </button>
        </div>
        {audit.enabled && (
          <div className="p-4 space-y-3">
            <div className="space-y-2">
              {[
                { key: 'logQuery' as const, label: 'Log SQL Queries', desc: 'Record the generated SQL statement' },
                { key: 'logParams' as const, label: 'Log Parameters', desc: 'Record query bind parameters (may contain PII)' },
                { key: 'logDuration' as const, label: 'Log Duration', desc: 'Record query execution time in milliseconds' },
              ].map(opt => (
                <div key={opt.key} className="flex items-center justify-between rounded-lg bg-fd-accent/30 px-3 py-2">
                  <div>
                    <span className="text-xs text-fd-foreground">{opt.label}</span>
                    <p className="text-[10px] text-fd-muted-foreground">{opt.desc}</p>
                  </div>
                  <button
                    onClick={() => setAudit({ ...audit, [opt.key]: !audit[opt.key] })}
                    className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${audit[opt.key] ? 'bg-fd-primary' : 'bg-fd-accent'}`}
                  >
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${audit[opt.key] ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>

            {audit.logParams && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                Warning: Query parameters may contain PII. Consider disabling in production or reducing retention.
              </p>
            )}

            <div>
              <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wide">Retention Period</span>
              <div className="mt-1.5 flex gap-1.5">
                {retentionOptions.map(r => (
                  <button
                    key={r}
                    onClick={() => setAudit({ ...audit, retention: r })}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                      audit.retention === r
                        ? 'border-fd-primary bg-fd-primary/10 text-fd-primary'
                        : 'border-fd-border text-fd-muted-foreground hover:border-fd-primary/50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
