import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import React from 'react'
import {
  Text,
  View,
  Pressable,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function HabitGoalScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  
  const currentType = params.badHabitType as 'stop' | 'limit'

  const selectType = (type: 'stop' | 'limit') => {
    if (type === 'limit') {
      router.push({
        pathname: '/habit-limit',
        params: { ...params, badHabitType: 'limit' }
      })
    } else {
      router.navigate({
        pathname: '/habit-config',
        params: { ...params, badHabitType: 'stop' }
      })
    }
  }

  const insets = useSafeAreaInsets()

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#0A0A0A]">
      <View className="px-5 py-4 flex-row items-center border-b border-white/5">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text className="text-white text-xl font-bold">Goal</Text>
      </View>

      <View className="px-5 pt-8 gap-4">
        <Pressable 
          onPress={() => selectType('stop')}
          className="flex-row items-center justify-between py-6 border-b border-white/5"
        >
          <View className="flex-row items-center gap-4">
            <Ionicons name="ban-outline" size={24} color="#71717a" />
            <Text className="text-white text-lg font-medium">Quit This Habit</Text>
          </View>
          {currentType === 'stop' && <Ionicons name="checkmark" size={24} color="#3b82f6" />}
        </Pressable>

        <Pressable 
          onPress={() => selectType('limit')}
          className="flex-row items-center justify-between py-6 border-b border-white/5"
        >
          <View className="flex-row items-center gap-4">
            <Ionicons name="arrow-down-outline" size={24} color="#71717a" />
            <Text className="text-white text-lg font-medium">No More Than</Text>
          </View>
          {currentType === 'limit' && <Ionicons name="checkmark" size={24} color="#3b82f6" />}
        </Pressable>
      </View>
    </View>
  )
}
