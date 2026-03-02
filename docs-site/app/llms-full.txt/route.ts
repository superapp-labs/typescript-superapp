import { generateLlmsFull } from '@/lib/llms-txt'

export const unstable_includeFiles = ['content/docs/**/*']

export function GET() {
  return new Response(generateLlmsFull(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
