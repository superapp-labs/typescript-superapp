'use client'

import { useEffect, useRef, useState } from 'react'

export function Mermaid({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false

    import('mermaid').then(({ default: mermaid }) => {
      if (cancelled) return
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
      })
      const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`
      mermaid.render(id, chart).then(({ svg }) => {
        if (cancelled || !containerRef.current) return
        containerRef.current.textContent = ''
        const template = document.createElement('template')
        template.innerHTML = svg
        containerRef.current.appendChild(template.content)
      }).catch((err) => {
        if (!cancelled) setError(String(err))
      })
    }).catch((err) => {
      if (!cancelled) setError(String(err))
    })

    return () => { cancelled = true }
  }, [chart])

  if (error) {
    return <pre className="text-red-500">{error}</pre>
  }

  return (
    <div
      ref={containerRef}
      className="my-4 flex justify-center [&_svg]:max-w-full"
    />
  )
}
