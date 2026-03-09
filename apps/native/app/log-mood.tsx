import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
  Text,
  View,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { orpc } from '@/utils/orpc'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { toLocalISOString } from '@/utils/date'

const MOODS = [
  { label: 'Terrible', emoji: '😣', color: '#E87A7A' },
  { label: 'Bad', emoji: '😕', color: '#F8B673' },
  { label: 'Okay', emoji: '😐', color: '#BDB455' },
  { label: 'Good', emoji: '😊', color: '#7AAAF8' },
  { label: 'Excellent', emoji: '🤩', color: '#E87A5E' },
]

const ACTIVITIES = [
  'Family', 'Friends', 'Love', 'Work', 'School', 'Health', 'Exercise', 'Food', 'Sleep', 'Hobby'
]

export default function LogMoodScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const queryClient = useQueryClient()
  
  const [selectedMood, setSelectedMood] = useState<string>('Okay')
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [context, setContext] = useState('')

  const today = toLocalISOString(new Date())
  const createMoodMutation = useMutation({
    ...orpc.moods.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.moods.getAll.queryKey()
      })
      router.back()
    }
  })

  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev => 
      prev.includes(activity) 
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    )
  }

  const handleSave = () => {
    const now = new Date()
    const date = toLocalISOString(now)
    const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

    createMoodMutation.mutate({
      mood: selectedMood as any,
      activities: selectedActivities,
      context,
      date,
      time,
    })
  }

  return (
    <Animated.View 
      entering={FadeIn}
      className="flex-1 bg-black/60"
    >
      <Pressable className="flex-1" onPress={() => router.back()} />
      
      <Animated.View 
        entering={SlideInDown.duration(400)}
        style={{ paddingBottom: insets.bottom + 20 }}
        className="bg-[#1C1C1E] rounded-t-[32px] px-6 pt-2"
      >
        <View className="w-10 h-1 bg-white/20 rounded-full self-center mb-6" />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-white text-xl font-bold mb-6">How do you feel right now?</Text>
            
            <View className="flex-row justify-between mb-8">
              {MOODS.map((m) => {
                const isSelected = selectedMood === m.label
                return (
                  <Pressable 
                    key={m.label} 
                    onPress={() => setSelectedMood(m.label)}
                    className="items-center gap-2"
                  >
                    <View className={`h-16 w-16 rounded-full items-center justify-center ${isSelected ? 'bg-blue-600' : 'bg-transparent'}`}>
                       <Text style={{ fontSize: 32 }}>{m.emoji}</Text>
                    </View>
                    <Text className={`text-[10px] font-medium ${isSelected ? 'text-blue-400' : 'text-gray-500'}`}>
                      {m.label}
                    </Text>
                  </Pressable>
                )
              })}
            </View>

            <Text className="text-white text-xl font-bold mb-6">What have you been up to?</Text>
            
            <View className="flex-row flex-wrap gap-3 mb-8">
              {ACTIVITIES.map((a) => {
                const isSelected = selectedActivities.includes(a)
                return (
                  <Pressable 
                    key={a}
                    onPress={() => toggleActivity(a)}
                    className={`px-6 py-3 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-zinc-800'}`}
                  >
                    <Text className="text-white font-medium">{a}</Text>
                  </Pressable>
                )
              })}
            </View>

            <Text className="text-white text-xl font-bold mb-4">Additional context</Text>
            <TextInput
              multiline
              placeholder="Add some notes..."
              placeholderTextColor="#71717a"
              className="bg-zinc-800 rounded-xl p-4 text-white min-h-[100px] mb-8"
              value={context}
              onChangeText={setContext}
            />

            <Pressable 
              onPress={handleSave}
              disabled={createMoodMutation.isPending}
              className={`bg-blue-600 h-16 rounded-3xl items-center justify-center ${createMoodMutation.isPending ? 'opacity-50' : ''}`}
            >
              <Text className="text-white text-xl font-bold">Save</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </Animated.View>
  )
}
