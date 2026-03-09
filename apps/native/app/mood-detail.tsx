import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import React from 'react'
import {
  Text,
  View,
  Pressable,
  ScrollView,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const MOOD_EMOJIS: Record<string, string> = {
  'Terrible': '😣',
  'Bad': '😕',
  'Okay': '😐',
  'Good': '😊',
  'Excellent': '🤩',
}

export default function MoodDetailScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams()
  
  const mood = params.mood as string
  const dateStr = params.date as string 
  const timeStr = params.time as string
  const activities = (params.activities as string)?.split(',').filter(Boolean) || []
  const context = params.context as string

  // Simple date formatter (e.g. "Monday, March 09")
  const formatDate = (date: string) => {
    try {
      const d = new Date(date)
      return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: '2-digit' })
    } catch {
      return date
    }
  }

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#0A0A0A]">
      <View className="px-5 py-4 flex-row items-center justify-between border-b border-white/5">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="text-white text-xl font-bold">{formatDate(dateStr)}</Text>
        </View>
        <Text style={{ fontSize: 24 }}>{MOOD_EMOJIS[mood]}</Text>
      </View>

      <ScrollView className="px-5 pt-8">
        <Text className="text-white text-xl font-bold mb-6">You've felt {mood.toLowerCase()} because of</Text>
        
        <View className="flex-row flex-wrap gap-3 mb-10">
          {activities.length > 0 ? (
            activities.map((a) => (
              <View 
                key={a}
                className="px-6 py-3 rounded-full bg-zinc-800"
              >
                <Text className="text-white font-medium">{a}</Text>
              </View>
            ))
          ) : (
            <Text className="text-gray-500 italic">No activities logged</Text>
          )}
        </View>

        {context ? (
          <>
            <Text className="text-white text-xl font-bold mb-4">Notes</Text>
            <View className="bg-zinc-800 rounded-xl p-6">
              <Text className="text-gray-300 leading-6">{context}</Text>
            </View>
          </>
        ) : null}
        
        <Text className="text-gray-600 text-sm mt-8">Logged at {timeStr}</Text>
      </ScrollView>
    </View>
  )
}
