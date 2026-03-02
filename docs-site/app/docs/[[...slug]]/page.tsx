import { source } from '@/lib/source'
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from 'fumadocs-ui/page'
import { notFound } from 'next/navigation'
import { useMDXComponents } from '@/mdx-components'
import { MessageSquare } from 'lucide-react'
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
      tableOfContent={{
        header: (
          <a
            href={buildClaudeUrl(params.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-3 flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
          >
            <MessageSquare className="size-3.5" />
            Chat in Claude
          </a>
        ),
      }}
      editOnGithub={{
        owner: 'superapp-labs',
        repo: 'typescript-superapp',
        sha: 'main',
        path: `docs-site/content/docs/${page.path}`,
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
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
