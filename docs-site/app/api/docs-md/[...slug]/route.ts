import { collectPages, CONTENT_DIR, generatePageMarkdown } from '@/lib/llms-txt'

export const dynamic = 'force-static'

export function generateStaticParams() {
  const pages = collectPages(CONTENT_DIR, '/docs')
  return pages
    .filter((page) => page.url !== '/docs')
    .map((page) => ({
      slug: page.url.replace(/^\/docs\//, '').split('/'),
    }))
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params
  const markdown = generatePageMarkdown(slug)

  if (!markdown) {
    return new Response('Not found', { status: 404 })
  }

  return new Response(markdown, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
