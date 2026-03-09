import { auth } from '@my-app/auth'
import { mongoDb } from '@my-app/db'
import { env } from '@my-app/env/server'
import { createSolanaClient } from '@my-app/solana-client'
import type { Context as HonoContext } from 'hono'
import { ObjectId } from 'mongodb'

const toId = (id: string | any) => {
  if (typeof id !== 'string') return id
  try {
    return new ObjectId(id)
  } catch (e) {
    return id
  }
}

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

  let session = await auth.api.getSession({
    headers: context.req.raw.headers,
  })

  // MANUAL TOKEN RESCUE
  // If getSession fails but we HAVE an Authorization header, try to manually find the session
  if (!session && authHeader?.startsWith('Bearer ')) {
    const tokenValue = authHeader.split(' ')[1]?.trim()
    console.log(`[Context] getSession failed. DB: ${mongoDb.databaseName}. Attempting Rescue for token: ${tokenValue?.substring(0, 5)}...`)
    
    try {
      if (tokenValue) {
        const sessionCol = mongoDb.collection('session')
        const allSessions = await sessionCol.find().toArray()
        console.log(`[Context] Debug: Total sessions in '${mongoDb.databaseName}.session': ${allSessions.length}`)
        
        if (allSessions.length > 0) {
          const first = allSessions[0]
          const sampleToken = first?.token || first?.sessionToken
          console.log(`[Context] Debug: Sample DB Token (last 5): ${sampleToken ? sampleToken.substring(sampleToken.length - 5) : 'none'}`)
        }

        // 1. Find session record - try both common field names
        const sessionRecord = await sessionCol.findOne({ 
          $or: [
            { sessionToken: tokenValue }, 
            { token: tokenValue }
          ] 
        })
        
        if (!sessionRecord) {
          console.log(`[Context] Rescue Failed: No match found among ${allSessions.length} records.`)
          console.log('[Context] --- DUMPING ALL SESSION TOKENS ---')
          allSessions.forEach((s, i) => {
            const t = s.token || s.sessionToken
            console.log(`  [${i}] Len: ${t?.length}, Prefix: ${t?.substring(0, 10)}... Suffix: ...${t?.substring(t.length - 5)}`)
          })
          console.log(`[Context] Seeking Token Len: ${tokenValue.length}, Prefix: ${tokenValue.substring(0, 10)}...`)
        } else if (new Date(sessionRecord.expiresAt) < new Date()) {
          console.log('[Context] Rescue Failed: Session found but expired.')
        } else {
          // 2. Find user record - try both string and ObjectId
          const userRecord = await mongoDb.collection('user').findOne({ 
            $or: [
              { _id: sessionRecord.userId },
              { _id: toId(sessionRecord.userId) }
            ] 
          })

          if (!userRecord) {
            console.log(`[Context] Rescue Failed: Session found for user ${sessionRecord.userId}, but user record is missing in '${mongoDb.databaseName}.user'!`)
          } else {
            console.log(`[Context] Rescue SUCCESS! Manually authenticated: ${userRecord.name || userRecord._id}`)
            session = {
              session: {
                id: sessionRecord._id.toString(),
                userId: sessionRecord.userId.toString(),
                token: sessionRecord.token || sessionRecord.sessionToken,
                expiresAt: new Date(sessionRecord.expiresAt),
                ipAddress: sessionRecord.ipAddress,
                userAgent: sessionRecord.userAgent,
                createdAt: new Date(sessionRecord.createdAt),
                updatedAt: new Date(sessionRecord.updatedAt),
              },
              user: {
                id: userRecord._id.toString(),
                email: userRecord.email,
                emailVerified: userRecord.emailVerified,
                name: userRecord.name,
                image: userRecord.image,
                createdAt: new Date(userRecord.createdAt),
                updatedAt: new Date(userRecord.updatedAt),
                dob: userRecord.dob,
              }
            } as any
          }
        }
      }
    } catch (e) {
      console.error('[Context] Rescue Error:', e)
    }
  }

  if (session) {
    console.log(`[Context] Session ACTIVE for user: ${session.user.id}`)
  } else {
    console.log(`[Context] No active session. Headers: Auth=${!!authHeader}, Cookie=${!!cookieHeader}`)
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
