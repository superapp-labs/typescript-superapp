import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = join(__dirname, '..', 'content', 'docs')
const PUBLIC_DIR = join(__dirname, '..', 'public')
const BASE_URL = '/docs'

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { meta: {}, body: raw }

  const meta = {}
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
  }
  return { meta, body: match[2] }
}

function stripMdxSyntax(body) {
  return body
    .replace(/^import\s+.*$/gm, '')
    .replace(/<(\w+)[^>]*\/>/g, '')
    .replace(/<(Tabs|Tab|Steps|Step|Accordions|Accordion|TypeTable|Callout|Cards|Card)\b[^>]*>([\s\S]*?)<\/\1>/g, '$2')
    .replace(/<\/?\w+[^>]*>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function toMdUrl(page) {
  if (page.file.endsWith('/index.mdx') || page.file.endsWith('\\index.mdx')) {
    return `${page.url}/index.md`
  }
  return `${page.url}.md`
}

function collectPages(dir, urlPrefix) {
  const metaPath = join(dir, 'meta.json')
  if (!existsSync(metaPath)) return []

  const meta = readJson(metaPath)
  const pages = []

  for (const slug of meta.pages) {
    const subDir = join(dir, slug)
    const mdxFile = join(dir, `${slug}.mdx`)
    const subMeta = join(subDir, 'meta.json')

    if (existsSync(subMeta)) {
      const indexMdx = join(subDir, 'index.mdx')
      const subPages = readJson(subMeta).pages
      if (existsSync(indexMdx) && !subPages.includes('index')) {
        pages.push({ file: indexMdx, url: `${urlPrefix}/${slug}` })
      }
      pages.push(...collectPages(subDir, `${urlPrefix}/${slug}`))
    } else if (existsSync(mdxFile)) {
      pages.push({ file: mdxFile, url: slug === 'index' ? urlPrefix : `${urlPrefix}/${slug}` })
    }
  }

  return pages
}

const pages = collectPages(CONTENT_DIR, BASE_URL)

// Generate llms.txt (index)
const indexLines = [
  '# superapp Documentation',
  '',
  '> A thin, secure data layer between your frontend and any database — with authentication, row-level permissions, and type safety built in.',
  '',
  `This file lists all ${pages.length} documentation pages. For the full content, see llms-full.txt.`,
  '',
]

for (const page of pages) {
  const { meta } = parseFrontmatter(readFileSync(page.file, 'utf-8'))
  const title = meta.title || page.url
  const desc = meta.description || ''
  const mdUrl = toMdUrl(page)
  indexLines.push(`- [${title}](${mdUrl})${desc ? `: ${desc}` : ''}`)
}

// Generate llms-full.txt
const fullLines = [
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

  fullLines.push('---', '')
  fullLines.push(`## ${title}`)
  if (desc) fullLines.push('', desc)
  fullLines.push(`\nURL: ${url}`, '')
  fullLines.push(cleaned, '')
}

// Write to public/
mkdirSync(PUBLIC_DIR, { recursive: true })
writeFileSync(join(PUBLIC_DIR, 'llms.txt'), indexLines.join('\n') + '\n')
writeFileSync(join(PUBLIC_DIR, 'llms-full.txt'), fullLines.join('\n') + '\n')

console.log(`Generated llms.txt (${pages.length} pages) and llms-full.txt`)
