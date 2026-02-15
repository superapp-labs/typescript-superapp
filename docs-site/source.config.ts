import { defineDocs, defineConfig } from 'fumadocs-mdx/config'
import { remarkStructure } from 'fumadocs-core/mdx-plugins'

export const docs = defineDocs({
  dir: 'content/docs',
})

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkStructure],
  },
})
