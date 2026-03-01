#!/usr/bin/env node

/**
 * Generates PAGE_INDEX.md from the docs MDX content.
 *
 * Walks the same meta.json tree as generate-llms-txt.mjs to produce
 * a markdown table of every page with its relative path and description.
 *
 * Run: node scripts/generate-page-index.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = join(__dirname, '..', 'content', 'docs')
const DOCS_SITE_DIR = join(__dirname, '..')
const OUTPUT_FILE = join(DOCS_SITE_DIR, 'PAGE_INDEX.md')

// --- Helpers (shared logic with generate-llms-txt.mjs) ---

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
    const key = line.slice(0, idx).trim()
    const val = line.slice(idx + 1).trim()
    meta[key] = val
  }
  return { meta, body: match[2] }
}

// --- Section label from meta.json title fields ---

function readSectionTitle(dir) {
  const metaPath = join(dir, 'meta.json')
  if (!existsSync(metaPath)) return null
  const meta = readJson(metaPath)
  return meta.title || null
}

// --- Tree walker (same as generate-llms-txt.mjs) ---

function collectPages(dir, urlPrefix) {
  const metaPath = join(dir, 'meta.json')
  if (!existsSync(metaPath)) return []

  const meta = readJson(metaPath)
  const pages = []

  for (const slug of meta.pages) {
    const subDir = join(dir, slug)
    const mdxFile = join(dir, `${slug}.mdx`)
    const subMeta = join(subDir, 'meta.json')

    // Directory with its own meta.json — recurse
    if (existsSync(subMeta)) {
      const sectionTitle = readSectionTitle(subDir)
      const indexMdx = join(subDir, 'index.mdx')
      if (existsSync(indexMdx)) {
        pages.push({ file: indexMdx, url: `${urlPrefix}/${slug}`, section: sectionTitle })
      }
      pages.push(...collectPages(subDir, `${urlPrefix}/${slug}`).map((p, i) => {
        // Mark the first page in a section (if no index.mdx took the section header)
        if (i === 0 && !existsSync(indexMdx) && sectionTitle) {
          return { ...p, section: sectionTitle }
        }
        return p
      }))
    } else if (existsSync(mdxFile)) {
      const url = slug === 'index' ? urlPrefix : `${urlPrefix}/${slug}`
      pages.push({ file: mdxFile, url })
    }
  }

  return pages
}

// --- Main ---

const pages = collectPages(CONTENT_DIR, '/docs')

const lines = [
  '# Documentation Page Index',
  '',
  '> **Auto-generated.** Run `node scripts/generate-page-index.mjs` to regenerate.',
  '> When adding, removing, or renaming any MDX page in `docs-site/content/`, re-run this script.',
  '',
  '| Path | Title | Description |',
  '|------|-------|-------------|',
]

for (const { file, section } of pages) {
  const raw = readFileSync(file, 'utf-8')
  const { meta } = parseFrontmatter(raw)
  const title = meta.title || '(untitled)'
  const desc = meta.description || ''
  const relPath = relative(join(DOCS_SITE_DIR, 'content'), file)

  // Insert section separator
  if (section) {
    lines.push(`| **${section}** | | |`)
  }

  lines.push(`| \`${relPath}\` | ${title} | ${desc} |`)
}

lines.push('', `**Total: ${pages.length} pages**`, '')

writeFileSync(OUTPUT_FILE, lines.join('\n'))
console.log(`Generated PAGE_INDEX.md (${pages.length} pages)`)
