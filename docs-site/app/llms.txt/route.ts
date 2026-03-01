import { generateLlmsIndex } from '@/lib/llms-txt'

export function GET() {
  return new Response(generateLlmsIndex(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
