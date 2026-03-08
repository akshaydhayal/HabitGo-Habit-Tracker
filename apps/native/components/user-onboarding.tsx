import { useMutation } from '@tanstack/react-query'
import { Button, Input, Spinner, Surface, TextField } from 'heroui-native'
import { useState } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'

import { authClient } from '@/lib/auth-client'
import { queryClient, orpc } from '@/utils/orpc'

export function UserOnboarding({ defaultName }: { defaultName?: string }) {
  const [name, setName] = useState(defaultName || '')
  const [dob, setDob] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateProfileMutation = useMutation(
    orpc.user.updateProfile.mutationOptions({
      onSuccess: async () => {
        // Refresh the session so Better-Auth knows the local cache is stale
        await authClient.getSession()
        queryClient.invalidateQueries()
        setIsSubmitting(false)
      },
      onError: (err: any) => {
        console.error('Failed to update profile', err)
        Alert.alert('Update Failed', err.message || 'An unexpected error occurred.')
        setIsSubmitting(false)
      }
    })
  )

  const handleUpdateProfile = () => {
    if (!name.trim() || !dob.trim()) {
      Alert.alert('Missing Info', 'Please fill out both your name and Date of Birth.')
      return
    }

    setIsSubmitting(true)
    updateProfileMutation.mutate({ name, dob })
  }

  return (
    <Surface variant="secondary" className="p-6 rounded-2xl border border-muted/20">
      <Text className="text-2xl font-bold text-foreground mb-2">Welcome to Solana Habits!</Text>
      <Text className="text-sm text-muted mb-6">Let's set up your profile before you start tracking.</Text>

      <Text className="text-sm font-medium text-foreground mb-1">Your Name</Text>
      <View className="mb-4">
        <TextField>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            editable={!isSubmitting}
          />
        </TextField>
      </View>

      <Text className="text-sm font-medium text-foreground mb-1">Date of Birth</Text>
      <View className="mb-6">
        <TextField>
          <Input
            value={dob}
            onChangeText={setDob}
            placeholder="YYYY-MM-DD"
            editable={!isSubmitting}
          />
        </TextField>
      </View>

      <Button
        variant={!name.trim() || !dob.trim() ? 'secondary' : 'primary'}
        isDisabled={!name.trim() || !dob.trim() || isSubmitting}
        onPress={handleUpdateProfile}
      >
        {isSubmitting ? <Spinner size="sm" color="default" /> : <Text className="font-semibold text-white">Complete Profile</Text>}
      </Button>
    </Surface>
  )
}
