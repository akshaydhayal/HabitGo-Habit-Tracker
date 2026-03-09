import { google } from '@ai-sdk/google'
import { createContext } from '@my-app/api/context'
import { appRouter } from '@my-app/api/routers/index'
import { auth } from '@my-app/auth'
import { env } from '@my-app/env/server'
import { OpenAPIHandler } from '@orpc/openapi/fetch'
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins'
import { onError } from '@orpc/server'
import { RPCHandler } from '@orpc/server/fetch'
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'
import { convertToModelMessages, streamText } from 'ai'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

console.log('🚀 Server starting...')
console.log(`  DATABASE_URL: ${env.DATABASE_URL.replace(/:[^:]+@/, ':****@')}`) // Mask password
console.log(`  BETTER_AUTH_URL: ${env.BETTER_AUTH_URL}`)
console.log(`  CORS_ORIGINS: ${env.CORS_ORIGINS.join(', ')}`)
console.log(`  SOLANA_CLUSTER: ${env.SOLANA_CLUSTER}`)
console.log(`  SOLANA_ENDPOINT: ${new URL(env.SOLANA_ENDPOINT).origin}`)
console.log(`  SOLANA_EMAIL_DOMAIN: ${env.SOLANA_EMAIL_DOMAIN}`)
console.log(`  NODE_ENV: ${env.NODE_ENV}`)

import { connectDB } from '@my-app/db'
await connectDB()
const app = new Hono()

app.use(logger())
app.use(
  '/*',
  cors({
    origin: env.CORS_ORIGINS,
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Cookie', 'expo-origin', 'x-skip-oauth-proxy'],
    credentials: true,
  }),
)

app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))

export const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error('[API Error]:', error)
      if (error instanceof Error && 'cause' in error) console.error('Cause:', error.cause)
    }),
  ],
})

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error('[RPC Error]:', error)
      if (error instanceof Error && 'cause' in error) console.error('Cause:', error.cause)
    }),
  ],
})

app.use('/*', async (c, next) => {
  const context = await createContext({ context: c })

  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: '/rpc',
    context: context,
  })

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response)
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: '/api-reference',
    context: context,
  })

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response)
  }

  await next()
})

app.post('/ai', async (c) => {
  const body = await c.req.json()
  const uiMessages = body.messages || []
  const result = streamText({
    model: google('gemini-2.5-flash'),
    messages: await convertToModelMessages(uiMessages),
  })

  return result.toUIMessageStreamResponse()
})

app.get('/', (c) => {
  return c.text('OK')
})

import { serve } from '@hono/node-server'

const port = Number(env.PORT || 3000)
console.log(`📡 Hono node-server starting on port ${port}...`)
serve({
  fetch: app.fetch,
  port
})

export default app

