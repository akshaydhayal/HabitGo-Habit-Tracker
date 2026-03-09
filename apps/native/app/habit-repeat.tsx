import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import {
  Text,
  View,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function HabitRepeatScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const insets = useSafeAreaInsets()

  const [repeatMode, setRepeatMode] = useState<'weekly' | 'monthly'>(params.repeatMode as any || 'weekly')
  const [weeklyDays, setWeeklyDays] = useState<string[]>(
    params.weeklyDays ? (params.weeklyDays as string).split(',') : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  )
  const [monthlyDays, setMonthlyDays] = useState<number[]>(
    params.monthlyDays ? (params.monthlyDays as string).split(',').map(Number) : [1]
  )

  const toggleWeeklyDay = (day: string) => {
    setWeeklyDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  const toggleMonthlyDay = (day: number) => {
    setMonthlyDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  const handleSave = () => {
    router.navigate({
      pathname: '/habit-config',
      params: { 
        ...params, 
        repeatMode,
        weeklyDays: weeklyDays.join(','),
        monthlyDays: monthlyDays.join(',')
      }
    })
  }

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#0A0A0A]">
      <View className="px-5 py-4 flex-row items-center border-b border-white/5">
        <Pressable onPress={handleSave} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text className="text-white text-xl font-bold">Repeat</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-8">
        {/* Mode Selection */}
        <View className="gap-6 mb-10">
          <Pressable 
            onPress={() => setRepeatMode('weekly')}
            className="flex-row items-center gap-4"
          >
            <View className={`h-6 w-6 rounded-full border-2 items-center justify-center ${repeatMode === 'weekly' ? 'border-[#3b82f6]' : 'border-zinc-700'}`}>
              {repeatMode === 'weekly' && <View className="h-3 w-3 rounded-full bg-[#3b82f6]" />}
            </View>
            <Text className="text-white text-lg font-medium">Weekly</Text>
          </Pressable>

          <Pressable 
            onPress={() => setRepeatMode('monthly')}
            className="flex-row items-center gap-4"
          >
            <View className={`h-6 w-6 rounded-full border-2 items-center justify-center ${repeatMode === 'monthly' ? 'border-[#3b82f6]' : 'border-zinc-700'}`}>
              {repeatMode === 'monthly' && <View className="h-3 w-3 rounded-full bg-[#3b82f6]" />}
            </View>
            <Text className="text-white text-lg font-medium">Monthly</Text>
          </Pressable>
        </View>

        <View className="h-[1px] bg-white/5 mb-8" />

        {repeatMode === 'weekly' ? (
          <View>
             <Text className="text-zinc-500 mb-6">Choose on which days of the week to repeat this habit. Perfect for a standard weekly routine.</Text>
             <View className="gap-2">
                {DAYS.map((day, index) => {
                  const short = DAY_SHORT[index]
                  const isSelected = weeklyDays.includes(short)
                  return (
                    <Pressable 
                      key={day}
                      onPress={() => toggleWeeklyDay(short)}
                      className="flex-row items-center justify-between py-4 border-b border-white/5"
                    >
                      <Text className="text-white text-lg">{day}</Text>
                      {isSelected && <Ionicons name="checkmark" size={24} color="#3b82f6" />}
                    </Pressable>
                  )
                })}
             </View>
          </View>
        ) : (
          <View>
             <Text className="text-zinc-500 mb-6">Choose on which days of the month to repeat this habit.</Text>
             <View className="flex-row flex-wrap gap-2">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  const isSelected = monthlyDays.includes(day)
                  return (
                    <Pressable 
                      key={day}
                      onPress={() => toggleMonthlyDay(day)}
                      className={`h-11 w-11 rounded-full items-center justify-center ${isSelected ? 'bg-[#3b82f6]' : 'bg-zinc-800'}`}
                    >
                      <Text className="text-white font-bold">{day}</Text>
                    </Pressable>
                  )
                })}
             </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
