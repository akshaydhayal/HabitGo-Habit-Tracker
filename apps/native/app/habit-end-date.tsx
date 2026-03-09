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
import { toLocalISOString } from '@/utils/date'

const { width } = Dimensions.get('window')
const COLUMN_WIDTH = (width - 80) / 7
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function HabitEndDateScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const insets = useSafeAreaInsets()

  const today = toLocalISOString(new Date())
  const [mode, setMode] = useState<'never' | 'date'>(params.endDate ? 'date' : 'never')
  const [selectedDate, setSelectedDate] = useState(params.endDate as string || today)
  const [viewDate, setViewDate] = useState(new Date(selectedDate))

  const handleSave = () => {
    router.navigate({
      pathname: '/habit-config',
      params: { 
        ...params, 
        endDate: mode === 'never' ? '' : selectedDate 
      }
    })
  }

  // Calendar Logic
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const emptyDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1)
    return { label: (i + 1).toString(), value: toLocalISOString(d) }
  })

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#0A0A0A]">
      <View className="px-5 py-4 flex-row items-center border-b border-white/5">
        <Pressable onPress={handleSave} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text className="text-white text-xl font-bold">End Date</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-8">
        <View className="gap-6 mb-10">
          <Pressable 
            onPress={() => setMode('never')}
            className="flex-row items-center gap-4"
          >
            <View className={`h-6 w-6 rounded-full border-2 items-center justify-center ${mode === 'never' ? 'border-[#3b82f6]' : 'border-zinc-700'}`}>
              {mode === 'never' && <View className="h-3 w-3 rounded-full bg-[#3b82f6]" />}
            </View>
            <Text className="text-white text-lg font-medium">Never</Text>
          </Pressable>

          <Pressable 
            onPress={() => setMode('date')}
            className="flex-row items-center gap-4"
          >
            <View className={`h-6 w-6 rounded-full border-2 items-center justify-center ${mode === 'date' ? 'border-[#3b82f6]' : 'border-zinc-700'}`}>
              {mode === 'date' && <View className="h-3 w-3 rounded-full bg-[#3b82f6]" />}
            </View>
            <Text className="text-white text-lg font-medium">On a Date</Text>
          </Pressable>
        </View>

        {mode === 'date' && (
          <View className="bg-[#1C1C1E] rounded-3xl overflow-hidden border border-white/10 p-6">
            <View className="flex-row items-center justify-between mb-8">
              <Text className="text-white text-xl font-bold">
                {MONTHS[month]} {year}
              </Text>
              <View className="flex-row gap-4">
                <Pressable 
                  onPress={() => setViewDate(new Date(year, month - 1, 1))}
                  className="h-8 w-8 bg-zinc-800 rounded-full items-center justify-center"
                >
                  <Ionicons name="chevron-back" size={16} color="white" />
                </Pressable>
                <Pressable 
                  onPress={() => setViewDate(new Date(year, month + 1, 1))}
                  className="h-8 w-8 bg-zinc-800 rounded-full items-center justify-center"
                >
                  <Ionicons name="chevron-forward" size={16} color="white" />
                </Pressable>
              </View>
            </View>

            <View className="flex-row mb-4">
              {DAYS.map(day => (
                <View key={day} style={{ width: COLUMN_WIDTH }} className="items-center">
                  <Text className="text-zinc-600 font-bold text-[10px] uppercase">{day}</Text>
                </View>
              ))}
            </View>

            <View className="flex-row flex-wrap">
              {Array.from({ length: emptyDays }).map((_, i) => (
                <View key={`empty-${i}`} style={{ width: COLUMN_WIDTH }} className="h-10" />
              ))}
              
              {calendarDays.map((d) => {
                const isSelected = selectedDate === d.value
                const isToday = today === d.value
                
                return (
                  <Pressable 
                    key={d.value} 
                    onPress={() => setSelectedDate(d.value)}
                    style={{ width: COLUMN_WIDTH }}
                    className="h-10 items-center justify-center"
                  >
                    <View className={`h-8 w-8 rounded-full items-center justify-center ${
                      isSelected ? 'bg-[#3b82f6]' : isToday ? 'bg-zinc-800' : ''
                    }`}>
                      <Text className={`text-sm font-medium ${
                        isSelected ? 'text-white' : isToday ? 'text-[#3b82f6]' : 'text-zinc-300'
                      }`}>
                        {d.label}
                      </Text>
                    </View>
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
