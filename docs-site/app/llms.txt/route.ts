import { generateLlmsIndex } from '@/lib/llms-txt'

// Ensure standalone build includes the content directory
export const unstable_includeFiles = ['content/docs/**/*']

export function GET() {
  return new Response(generateLlmsIndex(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
