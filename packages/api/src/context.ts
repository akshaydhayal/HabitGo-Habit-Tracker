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
  
  const headers = new Headers()
  if (authHeader) headers.set('Authorization', authHeader)
  if (cookieHeader) headers.set('Cookie', cookieHeader)

  const session = await auth.api.getSession({
    headers,
  })

  if (session) {
    console.log(`[Context] Session found for user: ${session.user.id}`)
  } else {
    console.log(`[Context] No session found. Headers present: Auth=${!!authHeader}, Cookie=${!!cookieHeader}`)
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
