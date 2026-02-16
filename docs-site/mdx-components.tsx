import defaultComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import { Mermaid } from '@/components/mermaid'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...defaultComponents,
    Mermaid,
    pre: (props: any) => {
      const child = props.children
      if (
        child?.props?.className === 'language-mermaid' &&
        typeof child?.props?.children === 'string'
      ) {
        return <Mermaid chart={child.props.children.trim()} />
      }
      if (defaultComponents.pre) {
        return defaultComponents.pre(props)
      }
      return <pre {...props} />
    },
    ...components,
  }
}
