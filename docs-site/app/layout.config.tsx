import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: 'superapp',
  },
  links: [
    {
      text: 'Docs',
      url: '/docs',
      active: 'nested-url',
    },
    {
      text: 'GitHub',
      url: 'https://github.com/superapp-labs/typescript-superapp',
      external: true,
    },
    {
      text: 'Feedback',
      url: 'https://github.com/superapp-labs/typescript-superapp/discussions',
      external: true,
    },
    {
      text: 'Chat with Claude',
      url: 'https://claude.ai/new?q=Use%20https%3A%2F%2Ftypescript-superapp.bunnytech.app%2Fllms-full.txt%0AAnswer%20the%20following%20question%3A%0A%0A',
      external: true,
    },
  ],
}
