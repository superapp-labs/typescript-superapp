import { visit } from 'unist-util-visit'
import type { Root } from 'mdast'

export function remarkMermaid() {
  return (tree: Root) => {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang !== 'mermaid' || index === undefined || !parent) return

      parent.children.splice(index, 1, {
        type: 'mdxJsxFlowElement' as any,
        name: 'Mermaid',
        attributes: [
          {
            type: 'mdxJsxAttribute' as any,
            name: 'chart',
            value: node.value,
          },
        ],
        children: [],
      })
    })
  }
}
