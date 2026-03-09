import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import React, { useState, useEffect } from 'react'
import {
  Text,
  View,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { orpc } from '@/utils/orpc'
import { toLocalISOString } from '@/utils/date'
import { useQueryClient, useMutation } from '@tanstack/react-query'

const { width } = Dimensions.get('window')
const COLUMN_WIDTH = (width - 80) / 7 // Modal padding adjustment

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function HabitConfigScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const queryClient = useQueryClient()
  const insets = useSafeAreaInsets()

  
  const [name, setName] = useState(params.name as string || '')
  const [color, setColor] = useState(params.color as string || '#3b82f6')
  const [icon, setIcon] = useState(params.icon as string || 'flame')
  const [type, setType] = useState(params.type as 'good' | 'bad' || 'bad')
  
  // Goal state
  const [badHabitType, setBadHabitType] = useState<'stop' | 'limit'>(params.badHabitType as any || 'stop')
  const [goalValue, setGoalValue] = useState(Number(params.goalValue) || 1)
  const [goalUnit, setGoalUnit] = useState(params.goalUnit as string || 'times')
  const [goalFrequency, setGoalFrequency] = useState(params.goalFrequency as string || 'per week')
  
  // Date state
  const today = toLocalISOString(new Date())
  const [startDate, setStartDate] = useState(params.startDate as string || today)
  const [isCalendarVisible, setIsCalendarVisible] = useState(false)
  const [viewDate, setViewDate] = useState(new Date(startDate))

  const createHabit = useMutation({
    ...orpc.habits.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(orpc.habits.getAll.queryOptions())
      router.dismissAll()
      router.replace('/(tabs)')
    }
  })

  // Update state when params change (from sub-screens)
  useEffect(() => {
    if (params.name) setName(params.name as string)
    if (params.color) setColor(params.color as string)
    if (params.icon) setIcon(params.icon as string)
    if (params.type) setType(params.type as any)
    if (params.badHabitType) setBadHabitType(params.badHabitType as any)
    if (params.goalValue) setGoalValue(Number(params.goalValue))
    if (params.goalUnit) setGoalUnit(params.goalUnit as string)
    if (params.goalFrequency) setGoalFrequency(params.goalFrequency as string)
    if (params.startDate) setStartDate(params.startDate as string)
  }, [params])

  const handleSave = () => {
    createHabit.mutate({
      name,
      type,
      badHabitType,
      goalValue: badHabitType === 'limit' ? goalValue : undefined,
      goalUnit: badHabitType === 'limit' ? goalUnit : undefined,
      goalFrequency: badHabitType === 'limit' ? goalFrequency : undefined,
      startDate,
      color,
      frequency: ['Daily'], // Default for now
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

  const goalText = badHabitType === 'stop' 
    ? 'Quit This Habit' 
    : `No more than ${goalValue} ${goalUnit} ${goalFrequency}`

  const dateText = startDate === today
    ? 'Start from Today'
    : `Starts on ${startDate}`

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#0A0A0A]">
      <View className="px-5 py-4 flex-row items-center justify-between border-b border-white/5">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="white" />
        </Pressable>
        <Pressable 
          onPress={handleSave}
          disabled={createHabit.isPending}
          className="bg-[#3b82f6] px-6 py-2 rounded-lg"
        >
          <Text className="text-white font-bold text-base">
            {createHabit.isPending ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>
      </View>

      <View className="px-5 pt-8">
        <View className="flex-row items-center gap-4 mb-10">
          <View 
            style={{ backgroundColor: `${color}20` }} 
            className="h-14 w-14 rounded-2xl items-center justify-center"
          >
            <Ionicons name={icon as any} size={32} color={color} />
          </View>
          <Text className="text-white text-2xl font-bold">{name}</Text>
        </View>

        <View className="gap-2">
          <Pressable 
            onPress={() => router.push({
              pathname: '/habit-goal',
              params: { name, color, icon, type, badHabitType, goalValue, goalUnit, goalFrequency, startDate }
            })}
            className="flex-row items-center justify-between py-6 border-b border-white/5"
          >
            <View className="flex-row items-center gap-4">
              <Ionicons name="locate" size={24} color="#71717a" />
              <Text className="text-white text-lg font-medium">{goalText}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#71717a" />
          </Pressable>

          <Pressable 
            onPress={() => setIsCalendarVisible(true)}
            className="flex-row items-center justify-between py-6 border-b border-white/5"
          >
            <View className="flex-row items-center gap-4">
              <Ionicons name="calendar-outline" size={24} color="#71717a" />
              <Text className="text-white text-lg font-medium">{dateText}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#71717a" />
          </Pressable>
        </View>
      </View>

      {/* Calendar Modal */}
      <Modal
        visible={isCalendarVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCalendarVisible(false)}
      >
        <Pressable 
          onPress={() => setIsCalendarVisible(false)}
          className="flex-1 bg-black/80 items-center justify-center px-5"
        >
          <Pressable onPress={(e) => e.stopPropagation()} className="bg-[#1C1C1E] w-full rounded-3xl overflow-hidden border border-white/10">
            <View className="p-6">
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
                  const isSelected = startDate === d.value
                  const isToday = today === d.value
                  
                  return (
                    <Pressable 
                      key={d.value} 
                      onPress={() => {
                        setStartDate(d.value)
                        setIsCalendarVisible(false)
                      }}
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
              
              <Pressable 
                onPress={() => {
                  setStartDate(today)
                  setIsCalendarVisible(false)
                }}
                className="mt-8 py-3 rounded-xl bg-zinc-800 items-center"
              >
                <Text className="text-white font-bold">Reset to Today</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}
