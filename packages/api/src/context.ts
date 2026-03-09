import { auth } from '@my-app/auth'
import { env } from '@my-app/env/server'
import { createSolanaClient } from '@my-app/solana-client'
import type { Context as HonoContext } from 'hono'

export type CreateContextOptions = {
  context: HonoContext
}

export async function createContext({ context }: CreateContextOptions) {
  const authHeader = context.req.header('Authorization')
  const cookieHeader = context.req.header('Cookie')
  
  // Exhaustive logging for debugging
  console.log('[Context] All Incoming Header Keys:', Array.from(context.req.raw.headers.keys()).join(', '))
  if (cookieHeader) {
    const keys = cookieHeader.split(';').map(c => c.split('=')[0].trim())
    console.log(`[Context] Received Cookie Keys: ${keys.join(', ')}`)
  }

  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  })

  if (session) {
    console.log(`[Context] Session found for user: ${session.user.id}`)
  } else {
    console.log(`[Context] No session found. Auth present: ${!!authHeader}, Cookie present: ${!!cookieHeader}`)
  }

  const solana = createSolanaClient({
    url: env.SOLANA_ENDPOINT,
  })

  return {
    session,
    solana,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
