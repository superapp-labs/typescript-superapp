import { source } from '@/lib/source'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import type { ReactNode } from 'react'
import { baseOptions } from '@/app/layout.config'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      {...baseOptions}
      sidebar={{
        defaultOpenLevel: 0,
        banner: (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
            <p className="font-medium">Not yet implemented</p>
            <p className="mt-0.5 opacity-80">
              This project is in the speccing phase.{' '}
              <a
                href="https://github.com/superapp-labs/typescript-superapp/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Propose spec changes
              </a>
            </p>
          </div>
        ),
      }}
    >
      {children}
    </DocsLayout>
  )
}
