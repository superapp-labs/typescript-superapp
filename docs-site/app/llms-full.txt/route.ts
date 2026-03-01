import { generateLlmsFull } from '@/lib/llms-txt'

export function GET() {
  return new Response(generateLlmsFull(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
