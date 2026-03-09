import type {
  SolanaAuthNonceResponse,
  SolanaAuthVerifyResponse,
} from '@my-app/better-auth-solana/client'
import { getBase58Decoder, getBase64Encoder } from '@solana/kit'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { useState } from 'react'
import { Alert } from 'react-native'
import { authClient } from '@/lib/auth-client'
import { queryClient } from '@/utils/orpc'

export function useSolanaSignIn() {
  const { account, connect, signIn } = useMobileWallet()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      const activeAccount = account || (await connect())
      const address = activeAccount.address

      const { data: nonce, error: nonceError } =
        await authClient.$fetch<SolanaAuthNonceResponse>('/solana-auth/nonce', {
          method: 'POST',
          body: { walletAddress: address },
        })

      if (nonceError || !nonce) {
        throw new Error(nonceError?.message || 'Failed to get nonce')
      }

      const result = await signIn({
        address,
        domain: nonce.domain,
        nonce: nonce.nonce,
        statement: 'Sign in to My App',
      })

      // MWA returns Base64 strings encoded as ascii Uint8Arrays...
      const signatureBase64 = new TextDecoder().decode(result.signature)
      const signatureBase58 = getBase58Decoder().decode(
        getBase64Encoder().encode(signatureBase64),
      )

      const messageBase64 = new TextDecoder().decode(result.signedMessage)
      const messageUtf8 = new TextDecoder().decode(
        getBase64Encoder().encode(messageBase64),
      )

      const { data: verifyData, error: verifyError } =
        await authClient.$fetch<SolanaAuthVerifyResponse>(
          '/solana-auth/verify',
          {
            method: 'POST',
            body: {
              walletAddress: address,
              signature: signatureBase58,
              message: messageUtf8,
            },
          },
        )

      if (verifyError || !verifyData) {
        throw new Error(verifyError?.message || 'Verification failed')
      }

      queryClient.invalidateQueries()
      await authClient.getSession()
    } catch (error) {
      console.error('Solana sign in failed', error)
      Alert.alert(
        'Sign In Failed',
        error instanceof Error ? error.message : String(error),
      )
    } finally {
      setIsLoading(false)
    }
  }

  return {
    handleSignIn,
    isLoading,
  }
}
