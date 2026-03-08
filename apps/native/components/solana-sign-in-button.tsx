import { Ionicons } from '@expo/vector-icons'
import { Button, Spinner, useThemeColor } from 'heroui-native'
import { Text } from 'react-native'
import { useSolanaSignIn } from '@/hooks/use-solana-sign-in'

export function SolanaSignInButton() {
  const { handleSignIn, isLoading } = useSolanaSignIn()

  return (
    <Button
      onPress={handleSignIn}
      isDisabled={isLoading}
      variant="primary"
      className="w-full flex-row items-center justify-center gap-2 py-4"
    >
      {isLoading ? (
        <Spinner size="sm" color="default" />
      ) : (
        <>
          <Ionicons name="wallet-outline" size={20} color="white" />
          <Text className="font-semibold text-white text-base">
            Connect Wallet & Sign In
          </Text>
        </>
      )}
    </Button>
  )
}
