import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import React, { useState, useEffect } from 'react'
import {
  Text,
  TextInput,
  View,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Modal,
  Dimensions,
  ScrollView,
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

const ICON_LIST = [
  'leaf', 'fitness', 'book', 'pencil', 'list', 'barbell', 'water', 'body', 
  'accessibility', 'heart', 'bicycle', 'walk', 'moon', 'cube', 'nutrition', 
  'cafe', 'code', 'musical-notes', 'football', 'timer', 'restaurant', 'flame',
  'star', 'trophy', 'rocket', 'sunny', 'cloudy-night', 'medal'
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
  const [badHabitType, setBadHabitType] = useState<'stop' | 'limit'>(params.badHabitType as any || 'limit')
  const [goalValue, setGoalValue] = useState(params.goalValue?.toString() || '1')
  const [goalUnit, setGoalUnit] = useState(params.goalUnit as string || 'times')
  const [goalFrequency, setGoalFrequency] = useState(params.goalFrequency as string || 'per day')
  
  // Customization state
  const [repeatMode, setRepeatMode] = useState<'weekly' | 'monthly'>(params.repeatMode as any || 'weekly')
  const [weeklyDays, setWeeklyDays] = useState(params.weeklyDays as string || 'Mon,Tue,Wed,Thu,Fri,Sat,Sun')
  const [monthlyDays, setMonthlyDays] = useState(params.monthlyDays as string || '1')
  const [reminders, setReminders] = useState(params.reminders as string || '')
  
  // Date state
  const today = toLocalISOString(new Date())
  const [startDate, setStartDate] = useState(params.startDate as string || today)
  const [endDate, setEndDate] = useState(params.endDate as string || '')
  const [isCalendarVisible, setIsCalendarVisible] = useState(false)
  const [isIconPickerVisible, setIsIconPickerVisible] = useState(false)
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
    if (params.goalValue) setGoalValue(params.goalValue?.toString())
    if (params.goalUnit) setGoalUnit(params.goalUnit as string)
    if (params.goalFrequency) setGoalFrequency(params.goalFrequency as string)
    if (params.repeatMode) setRepeatMode(params.repeatMode as any)
    if (params.weeklyDays) setWeeklyDays(params.weeklyDays as string)
    if (params.monthlyDays) setMonthlyDays(params.monthlyDays as string)
    if (params.reminders) setReminders(params.reminders as string)
    if (params.startDate) setStartDate(params.startDate as string)
    if (params.endDate !== undefined) setEndDate(params.endDate as string)
  }, [params])

  const handleSave = () => {
    createHabit.mutate({
      name,
      type,
      badHabitType: type === 'bad' ? badHabitType : undefined,
      goalValue: Number(goalValue),
      goalUnit,
      goalFrequency,
      repeatMode,
      weeklyDays: repeatMode === 'weekly' ? weeklyDays.split(',') : undefined,
      monthlyDays: repeatMode === 'monthly' ? monthlyDays.split(',').map(Number) : undefined,
      reminders: reminders ? reminders.split(',') : [],
      startDate,
      endDate: endDate || undefined,
      color,
      frequency: repeatMode === 'weekly' ? weeklyDays.split(',') : ['Daily'],
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

  const goalText = type === 'bad' && badHabitType === 'stop'
    ? 'Quit This Habit'
    : `${goalValue} ${goalUnit} ${goalFrequency}`

  const dateText = startDate === today
    ? 'Start from Today'
    : `Starts on ${startDate}`
    
  const repeatText = repeatMode === 'weekly' 
    ? (weeklyDays.split(',').length === 7 ? 'Everyday' : `Weekly (${weeklyDays.split(',').length} days)`)
    : `Monthly (${monthlyDays.split(',').length} days)`

  const remindersText = reminders 
    ? (reminders.split(',').length === 1 ? reminders : `${reminders.split(',').length} reminders`)
    : 'No reminders'

  const endText = endDate && endDate !== 'null' && endDate !== '' 
    ? `Ends on ${endDate}` 
    : 'Never end'

  const configParams = { name, color, icon, type, badHabitType, goalValue, goalUnit, goalFrequency, repeatMode, weeklyDays, monthlyDays, reminders, startDate, endDate }

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
          <Pressable 
            onPress={() => setIsIconPickerVisible(true)}
            style={{ backgroundColor: `${color}20` }} 
            className="h-14 w-14 rounded-2xl items-center justify-center"
          >
            <Ionicons name={icon as any} size={32} color={color} />
            <View className="absolute -bottom-1 -right-1 bg-zinc-800 rounded-full p-0.5 border border-black">
               <Ionicons name="pencil" size={10} color="white" />
            </View>
          </Pressable>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Habit Name"
            placeholderTextColor="#71717a"
            className="text-white text-2xl font-bold flex-1"
          />
        </View>

        <ScrollView className="gap-2 pb-20" showsVerticalScrollIndicator={false}>
          {type === 'good' ? (
            <>
              {/* 1. Repeat */}
              <Pressable 
                onPress={() => router.push({ pathname: '/habit-repeat', params: configParams })}
                className="flex-row items-center justify-between py-6 border-b border-white/5"
              >
                <View className="flex-row items-center gap-4">
                  <Ionicons name="repeat" size={24} color="#71717a" />
                  <View>
                     <Text className="text-[#71717a] text-xs font-bold uppercase mb-1">Repeat</Text>
                     <Text className="text-white text-lg font-medium">{repeatText}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#71717a" />
              </Pressable>

              {/* 2. Goal */}
              <Pressable 
                onPress={() => router.push({ pathname: '/habit-goal-good', params: configParams })}
                className="flex-row items-center justify-between py-6 border-b border-white/5"
              >
                <View className="flex-row items-center gap-4">
                  <Ionicons name="locate" size={24} color="#71717a" />
                  <View>
                     <Text className="text-[#71717a] text-xs font-bold uppercase mb-1">Goal</Text>
                     <Text className="text-white text-lg font-medium">{goalText}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#71717a" />
              </Pressable>

              {/* 3. Alerts */}
              <Pressable 
                onPress={() => router.push({ pathname: '/habit-alerts', params: configParams })}
                className="flex-row items-center justify-between py-6 border-b border-white/5"
              >
                <View className="flex-row items-center gap-4">
                  <Ionicons name="notifications-outline" size={24} color="#71717a" />
                  <View>
                     <Text className="text-[#71717a] text-xs font-bold uppercase mb-1">Reminders</Text>
                     <Text className="text-white text-lg font-medium">{remindersText}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#71717a" />
              </Pressable>

              {/* 4. Start Date */}
              <Pressable 
                onPress={() => setIsCalendarVisible(true)}
                className="flex-row items-center justify-between py-6 border-b border-white/5"
              >
                <View className="flex-row items-center gap-4">
                  <Ionicons name="calendar-outline" size={24} color="#71717a" />
                  <View>
                     <Text className="text-[#71717a] text-xs font-bold uppercase mb-1">Start Date</Text>
                     <Text className="text-white text-lg font-medium">{dateText}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#71717a" />
              </Pressable>

              {/* 5. End Date */}
              <Pressable 
                onPress={() => router.push({ pathname: '/habit-end-date', params: configParams })}
                className="flex-row items-center justify-between py-6 border-b border-white/5"
              >
                <View className="flex-row items-center gap-4">
                  <Ionicons name="calendar" size={24} color="#71717a" />
                  <View>
                     <Text className="text-[#71717a] text-xs font-bold uppercase mb-1">End Date</Text>
                     <Text className="text-white text-lg font-medium">{endText}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#71717a" />
              </Pressable>
            </>
          ) : (
            <>
              {/* Bad Habit Customization */}
              <Pressable 
                onPress={() => router.push({ pathname: '/habit-goal', params: configParams })}
                className="flex-row items-center justify-between py-6 border-b border-white/5"
              >
                <View className="flex-row items-center gap-4">
                  <Ionicons name="locate" size={24} color="#71717a" />
                  <View>
                     <Text className="text-[#71717a] text-xs font-bold uppercase mb-1">Goal</Text>
                     <Text className="text-white text-lg font-medium">{goalText}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#71717a" />
              </Pressable>

              <Pressable 
                onPress={() => setIsCalendarVisible(true)}
                className="flex-row items-center justify-between py-6 border-b border-white/5"
              >
                <View className="flex-row items-center gap-4">
                  <Ionicons name="calendar-outline" size={24} color="#71717a" />
                  <View>
                     <Text className="text-[#71717a] text-xs font-bold uppercase mb-1">Start Date</Text>
                     <Text className="text-white text-lg font-medium">{dateText}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#71717a" />
              </Pressable>
            </>
          )}
        </ScrollView>
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

      {/* Icon Picker Modal */}
      <Modal
        visible={isIconPickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsIconPickerVisible(false)}
      >
        <Pressable 
          onPress={() => setIsIconPickerVisible(false)}
          className="flex-1 bg-black/80 items-center justify-center px-5"
        >
          <Pressable onPress={(e) => e.stopPropagation()} className="bg-[#1C1C1E] w-full rounded-3xl overflow-hidden border border-white/10 p-6">
            <Text className="text-white text-xl font-bold mb-6">Choose Icon</Text>
            <View className="flex-row flex-wrap gap-4 justify-center">
              {ICON_LIST.map((item) => (
                <Pressable 
                  key={item}
                  onPress={() => {
                    setIcon(item)
                    setIsIconPickerVisible(false)
                  }}
                  className={`h-12 w-12 rounded-xl items-center justify-center ${icon === item ? 'bg-[#3b82f6]' : 'bg-zinc-800'}`}
                >
                  <Ionicons name={item as any} size={24} color="white" />
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}
