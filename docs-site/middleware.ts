import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  if (path.startsWith('/docs/') && path.endsWith('.md')) {
    const slug = path.slice(6, -3) // Strip '/docs/' prefix and '.md' suffix
    return NextResponse.rewrite(new URL(`/api/docs-md/${slug}`, request.url))
  }
}

export const config = {
  matcher: '/docs/:path*',
}
