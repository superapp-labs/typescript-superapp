import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const CONTENT_DIR = join(process.cwd(), 'content', 'docs')
const BASE_URL = '/docs'

interface Page {
  file: string
  url: string
}

interface Frontmatter {
  meta: Record<string, string>
  body: string
}

function readJson(path: string): { title: string; pages: string[] } {
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function parseFrontmatter(raw: string): Frontmatter {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { meta: {}, body: raw }

  const meta: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
  }
  return { meta, body: match[2] }
}

function stripMdxSyntax(body: string): string {
  return body
    .replace(/^import\s+.*$/gm, '')
    .replace(/<(\w+)[^>]*\/>/g, '')
    .replace(/<(Tabs|Tab|Steps|Step|Accordions|Accordion|TypeTable|Callout|Cards|Card)\b[^>]*>([\s\S]*?)<\/\1>/g, '$2')
    .replace(/<\/?\w+[^>]*>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function collectPages(dir: string, urlPrefix: string): Page[] {
  const metaPath = join(dir, 'meta.json')
  if (!existsSync(metaPath)) return []

  const meta = readJson(metaPath)
  const pages: Page[] = []

  for (const slug of meta.pages) {
    const subDir = join(dir, slug)
    const mdxFile = join(dir, `${slug}.mdx`)
    const subMeta = join(subDir, 'meta.json')

    if (existsSync(subMeta)) {
      const indexMdx = join(subDir, 'index.mdx')
      if (existsSync(indexMdx)) {
        pages.push({ file: indexMdx, url: `${urlPrefix}/${slug}` })
      }
      pages.push(...collectPages(subDir, `${urlPrefix}/${slug}`))
    } else if (existsSync(mdxFile)) {
      pages.push({ file: mdxFile, url: slug === 'index' ? urlPrefix : `${urlPrefix}/${slug}` })
    }
  }

  return pages
}

export function generateLlmsIndex(): string {
  const pages = collectPages(CONTENT_DIR, BASE_URL)
  const lines = [
    '# superapp Documentation',
    '',
    '> A thin, secure data layer between your frontend and any database — with authentication, row-level permissions, and type safety built in.',
    '',
    `This file lists all ${pages.length} documentation pages. For the full content, see llms-full.txt.`,
    '',
  ]

  for (const { file, url } of pages) {
    const { meta } = parseFrontmatter(readFileSync(file, 'utf-8'))
    const title = meta.title || url
    const desc = meta.description || ''
    lines.push(`- [${title}](${url})${desc ? `: ${desc}` : ''}`)
  }

  return lines.join('\n') + '\n'
}

export function generateLlmsFull(): string {
  const pages = collectPages(CONTENT_DIR, BASE_URL)
  const lines = [
    '# superapp Documentation (Full)',
    '',
    '> A thin, secure data layer between your frontend and any database — with authentication, row-level permissions, and type safety built in.',
    '',
  ]

  for (const { file, url } of pages) {
    const raw = readFileSync(file, 'utf-8')
    const { meta, body } = parseFrontmatter(raw)
    const title = meta.title || url
    const desc = meta.description || ''
    const cleaned = stripMdxSyntax(body)

    lines.push('---', '')
    lines.push(`## ${title}`)
    if (desc) lines.push('', desc)
    lines.push(`\nURL: ${url}`, '')
    lines.push(cleaned, '')
  }

  return lines.join('\n') + '\n'
}
