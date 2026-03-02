import { source } from '@/lib/source'
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from 'fumadocs-ui/page'
import { notFound } from 'next/navigation'
import { useMDXComponents } from '@/mdx-components'
import { BotMessageSquare } from 'lucide-react'
import type { Metadata } from 'next'

const DOCS_BASE = 'https://typescript-superapp.bunnytech.app'

function buildClaudeUrl(slug?: string[]) {
  const mdPath = slug ? `/docs/${slug.join('/')}.md` : '/docs/index.md'
  const query = `Use ${DOCS_BASE}${mdPath} and ${DOCS_BASE}/llms.txt for exploring the entire documentation.\nAnswer the following question:\n\n`
  return `https://claude.ai/new?q=${encodeURIComponent(query)}`
}

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>
}) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  const MDX = page.data.body

  return (
    <DocsPage
      toc={page.data.toc}
      editOnGithub={{
        owner: 'superapp-labs',
        repo: 'typescript-superapp',
        sha: 'main',
        path: `docs-site/content/docs/${page.path}`,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <DocsTitle>{page.data.title}</DocsTitle>
          <DocsDescription>{page.data.description}</DocsDescription>
        </div>
        <a
          href={buildClaudeUrl(params.slug)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 flex shrink-0 items-center gap-2 rounded-lg border bg-fd-card px-3 py-2 text-sm font-medium text-fd-foreground shadow-sm transition-colors hover:bg-fd-accent"
        >
          <BotMessageSquare className="size-5" />
          Chat in Claude
        </a>
      </div>
      <DocsBody>
        <MDX components={useMDXComponents({})} />
      </DocsBody>
    </DocsPage>
  )
}

export async function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>
}): Promise<Metadata> {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  return {
    title: page.data.title,
    description: page.data.description,
  }
}
