import { llmsIndex } from '@/lib/generated/llms-content'

export function GET() {
  return new Response(llmsIndex, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
