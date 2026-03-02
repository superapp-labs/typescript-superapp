import { llmsFull } from '@/lib/generated/llms-content'

export function GET() {
  return new Response(llmsFull, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
