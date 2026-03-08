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
  console.log(`[Context] Auth: ${authHeader ? 'YES' : 'NO'}, Cookie: ${cookieHeader ? 'YES' : 'NO'}`)

  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  })

  const solana = createSolanaClient({
    url: env.SOLANA_ENDPOINT,
  })

  return {
    session,
    solana,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
