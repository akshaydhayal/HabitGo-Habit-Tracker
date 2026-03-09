import { address, isAddress, isSignature, signature } from '@solana/kit'
import type { BetterAuthPlugin } from 'better-auth'
import { APIError, createAuthEndpoint } from 'better-auth/api'
import { z } from 'zod'
import { solanaAuthSchema } from './schema'
import type { SolanaAuthOptions } from './types'
import { generateNonce, verifySolanaSignature } from './verify-signature'

export const solanaAuth = (options: SolanaAuthOptions): BetterAuthPlugin => {
  const {
    domain,
    emailDomainName = 'solana.local',
    anonymous = true,
    nonceExpirationMs = 15 * 60 * 1000, // 15 minutes
    cluster = 'mainnet-beta',
  } = options

  return {
    id: 'solana-auth',
    schema: solanaAuthSchema,
    endpoints: {
      // POST /solana-auth/nonce - Generate a nonce for wallet authentication
      getNonce: createAuthEndpoint(
        '/solana-auth/nonce',
        {
          method: 'POST',
          body: z.object({
            walletAddress: z
              .string()
              .refine((val) => isAddress(val), {
                message: 'Invalid Solana address',
              })
              .transform((val) => address(val)),
          }),
        },
        async (ctx) => {
          const { walletAddress } = ctx.body
          const nonce = generateNonce()

          // Store nonce in verification table
          await ctx.context.internalAdapter.createVerificationValue({
            identifier: `solana:${walletAddress}:${cluster}`,
            value: nonce,
            expiresAt: new Date(Date.now() + nonceExpirationMs),
          })

          return ctx.json({
            nonce,
            domain,
            uri: ctx.context.options.baseURL || `https://${domain}`,
            issuedAt: new Date().toISOString(),
            expirationTime: new Date(
              Date.now() + nonceExpirationMs,
            ).toISOString(),
            chainId: cluster,
          })
        },
      ),

      // POST /solana-auth/verify - Verify signature and create session
      verify: createAuthEndpoint(
        '/solana-auth/verify',
        {
          method: 'POST',
          body: z.object({
            walletAddress: z
              .string()
              .refine((val) => isAddress(val), {
                message: 'Invalid Solana address',
              })
              .transform((val) => address(val)),
            signature: z
              .string()
              .refine((val) => isSignature(val), {
                message: 'Invalid Solana signature',
              })
              .transform((val) => signature(val)),
            message: z.string().min(1),
            email: z.email().optional(),
          }),
        },
        async (ctx) => {
          const { walletAddress, signature, message, email } = ctx.body

          // Require email if not anonymous
          if (!anonymous && !email) {
            throw new APIError('BAD_REQUEST', {
              message: 'Email is required for authentication',
            })
          }

          // Retrieve and validate nonce
          const nonceRecord =
            await ctx.context.internalAdapter.findVerificationValue(
              `solana:${walletAddress}:${cluster}`,
            )

          if (!nonceRecord) {
            throw new APIError('UNAUTHORIZED', {
              message: 'Invalid or expired nonce. Please request a new nonce.',
            })
          }

          if (new Date(nonceRecord.expiresAt) < new Date()) {
            // Delete expired nonce
            await ctx.context.internalAdapter.deleteVerificationByIdentifier(
              nonceRecord.identifier,
            )
            throw new APIError('UNAUTHORIZED', {
              message: 'Nonce has expired. Please request a new nonce.',
            })
          }

          // Verify the signature
          const isValid = await verifySolanaSignature({
            address: walletAddress,
            message,
            signature,
          })

          if (!isValid) {
            throw new APIError('UNAUTHORIZED', {
              message: 'Invalid signature',
            })
          }

          // Delete the used nonce (single-use)
          await ctx.context.internalAdapter.deleteVerificationByIdentifier(
            nonceRecord.identifier,
          )

          // Find or create user
          const adapter = ctx.context.adapter
          const internal = ctx.context.internalAdapter

          // Normalize for safety
          const normalizedAddress = walletAddress.toLowerCase()
          const normalizedEmail = (email || `${walletAddress}@${emailDomainName}`).toLowerCase()

          console.log(`[SolanaAuth] Verify attempt for ${walletAddress} (cluster: ${cluster})`)

          // 1. Check if wallet is already linked
          let walletRecord = await adapter.findOne({
            model: 'walletAddress',
            where: [
              { field: 'address', value: walletAddress },
              { field: 'cluster', value: cluster },
            ],
          })

          if (!walletRecord && normalizedAddress !== walletAddress) {
            walletRecord = await adapter.findOne({
              model: 'walletAddress',
              where: [
                { field: 'address', value: normalizedAddress },
                { field: 'cluster', value: cluster },
              ],
            })
          }
          
          let user: any = null
          let isNewUser = false

          if (walletRecord) {
            const userId = (walletRecord as any).userId
            console.log(`[SolanaAuth] Wallet record found. userId: ${userId}`)
            user = await internal.findUserById(userId)
            if (user) {
              console.log(`[SolanaAuth] User found by ID: ${user.id}`)
            }
          }

          // 2. Fallback: Check by email
          if (!user) {
            console.log(`[SolanaAuth] No user found by wallet. Trying normalized email: ${normalizedEmail}`)
            user = await internal.findUserByEmail(normalizedEmail)
            if (user) {
              console.log(`[SolanaAuth] User found by email: ${user.id}. Linking wallet...`)
              await adapter.create({
                model: 'walletAddress',
                data: {
                  id: crypto.randomUUID(),
                  userId: user.id,
                  address: walletAddress,
                  cluster,
                  isPrimary: true,
                  createdAt: new Date(),
                },
              })
            }
          }

          // 3. Final Fallback: Create new user
          if (!user) {
            console.log(`[SolanaAuth] No existing user found. Creating new user for: ${normalizedEmail}`)
            isNewUser = true
            user = await internal.createUser({
              email: normalizedEmail,
              emailVerified: !email,
              name: walletAddress.slice(0, 8),
            })
            console.log(`[SolanaAuth] New user created: ${user.id}`)

            await adapter.create({
              model: 'walletAddress',
              data: {
                id: crypto.randomUUID(),
                userId: user.id,
                address: walletAddress,
                cluster,
                isPrimary: true,
                createdAt: new Date(),
              },
            })
          }

          // 4. Create Session with forced ID consistency
          const finalUserId = String(user.id)
          console.log(`[SolanaAuth] Force-creating session for user: ${finalUserId}`)
          const session = await internal.createSession(finalUserId)
          console.log(`[SolanaAuth] Session created internally. UID in object: ${session.userId}`)

          // EMERGENCY REPAIR: If Better-Auth didn't use our finalUserId, we overwrite it in DB
          if (String(session.userId) !== finalUserId) {
            console.error(`[SolanaAuth] !!! ID MISMATCH DETECTED !!! Expected: ${finalUserId}, Got: ${session.userId}. Repairing...`)
            try {
               const { mongoDb } = await import('@my-app/db')
               const updateResult = await mongoDb.collection('session').updateOne(
                 { token: session.token },
                 { $set: { userId: finalUserId } }
               )
               console.log(`[SolanaAuth] Repair result: ${updateResult.modifiedCount} updated.`)
            } catch (e) {
               console.error('[SolanaAuth] Repair failure:', e)
            }
          }

          // Set session cookie
          await ctx.setSignedCookie(
            ctx.context.authCookies.sessionToken.name,
            session.token,
            ctx.context.secret,
            ctx.context.authCookies.sessionToken.attributes,
          )

          return ctx.json({
            user,
            session,
            isNewUser,
          })
        },
      ),

      // GET /solana-auth/wallets - Get user's linked wallets
      getWallets: createAuthEndpoint(
        '/solana-auth/wallets',
        {
          method: 'GET',
          requireHeaders: true,
        },
        async (ctx) => {
          // Get session from signed cookie
          const sessionToken = await ctx.getSignedCookie(
            ctx.context.authCookies.sessionToken.name,
            ctx.context.secret,
          )

          if (!sessionToken) {
            throw new APIError('UNAUTHORIZED', {
              message: 'Not authenticated',
            })
          }

          const sessionData =
            await ctx.context.internalAdapter.findSession(sessionToken)

          if (!sessionData) {
            throw new APIError('UNAUTHORIZED', {
              message: 'Invalid session',
            })
          }

          const wallets = await ctx.context.adapter.findMany({
            model: 'walletAddress',
            where: [{ field: 'userId', value: sessionData.user.id }],
          })

          return ctx.json({ wallets })
        },
      ),
    },
  }
}

export type { SolanaAuthOptions, SolanaAuthPlugin } from './types'
