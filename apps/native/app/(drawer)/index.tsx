import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { Card, Chip, useThemeColor } from 'heroui-native'
import { Pressable, Text, View } from 'react-native'

import { Container } from '@/components/container'
import { SolanaSignInButton } from '@/components/solana-sign-in-button'
import { UserOnboarding } from '@/components/user-onboarding'
import { authClient } from '@/lib/auth-client'
import { orpc, queryClient } from '@/utils/orpc'

export default function Home() {
  const healthCheck = useQuery(orpc.healthCheck.queryOptions())
  const privateData = useQuery(orpc.privateData.queryOptions())
  const isConnected = healthCheck?.data === 'OK'
  const isLoading = healthCheck?.isLoading
  const { data: session } = authClient.useSession()
  const { disconnect } = useMobileWallet()

  const mutedColor = useThemeColor('muted')
  const successColor = useThemeColor('success')
  const dangerColor = useThemeColor('danger')

  const needsOnboarding = session?.user && !(session.user as any).dob

  const handleSignOut = async () => {
    await authClient.signOut()
    await disconnect()
    queryClient.invalidateQueries()
  }

  return (
    <Container className="space-y-6 p-6">
      <View className="mb-6 py-4">
        <Text className="mb-2 font-bold text-4xl text-foreground">Solana Habits</Text>
        <Text className="text-muted text-sm">Track your progress seamlessly.</Text>
      </View>

      {needsOnboarding ? (
        <View className="mb-6">
          <UserOnboarding defaultName={session.user.name} />
        </View>
      ) : session?.user ? (
        <Card variant="secondary" className="mb-6 p-4">
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="mb-1 text-base text-foreground">
                Welcome, <Text className="font-semibold">{session.user.name || 'User'}</Text>
              </Text>
              <Text className="text-muted text-sm">Signed in with Solana Wallet</Text>
            </View>
            <Pressable
              className="rounded-lg bg-danger/10 px-4 py-2 active:opacity-70 border border-danger/20"
              onPress={handleSignOut}
            >
              <Text className="font-semibold text-danger text-sm">Disconnect</Text>
            </Pressable>
          </View>
        </Card>
      ) : null}

      {!session?.user && (
        <View className="mb-6">
          <Card variant="secondary" className="p-6 items-center">
            <Ionicons name="lock-closed-outline" size={32} color={mutedColor} className="mb-4" />
            <Text className="text-foreground font-medium text-lg mb-2">Authentication Required</Text>
            <Text className="text-muted text-center text-sm mb-6">Connect your Solana wallet to access your habits and private data.</Text>
            <SolanaSignInButton />
          </Card>
        </View>
      )}

      {session?.user && !needsOnboarding && (
        <>
          <Card variant="secondary" className="p-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Card.Title>System Status</Card.Title>
              <Chip
                variant="secondary"
                color={isConnected ? 'success' : 'danger'}
                size="sm"
              >
                <Chip.Label>{isConnected ? 'LIVE' : 'OFFLINE'}</Chip.Label>
              </Chip>
            </View>

            <Card className="p-4">
              <View className="flex-row items-center">
                <View
                  className={`mr-3 h-3 w-3 rounded-full ${isConnected ? 'bg-success' : 'bg-muted'}`}
                />
                <View className="flex-1">
                  <Text className="mb-1 font-medium text-foreground">
                    ORPC Backend
                  </Text>
                  <Card.Description>
                    {isLoading
                      ? 'Checking connection...'
                      : isConnected
                        ? 'Connected to API'
                        : 'API Disconnected'}
                  </Card.Description>
                </View>
                {isLoading && (
                  <Ionicons name="hourglass-outline" size={20} color={mutedColor} />
                )}
                {!isLoading && isConnected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={successColor}
                  />
                )}
                {!isLoading && !isConnected && (
                  <Ionicons name="close-circle" size={20} color={dangerColor} />
                )}
              </View>
            </Card>
          </Card>

          <Card variant="secondary" className="my-6 p-4">
            <Card.Title className="mb-3">Private Data</Card.Title>
            <Card.Description>
              {privateData.data?.message || 'You are signed out'}
            </Card.Description>
          </Card>
        </>
      )}

      {!session?.user && (
        <View className="flex gap-6">
          <SolanaSignInButton />
        </View>
      )}
    </Container>
  )
}
