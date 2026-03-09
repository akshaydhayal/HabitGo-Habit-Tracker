import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import React, { useState, useRef, useEffect, memo } from 'react'
import {
  Text,
  View,
  Pressable,
  FlatList,
  Modal,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const ITEM_HEIGHT = 50
const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

const getPaddedData = (data: string[]) => ['', '', ...data, '', '']

const PickerItem = memo(({ item, isSelected }: { item: string, isSelected: boolean }) => (
  <View style={{ height: ITEM_HEIGHT }} className="items-center justify-center">
    <Text className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-zinc-600'}`}>
      {item}
    </Text>
  </View>
))

const TimePickerColumn = memo(({ 
  data, 
  selectedValue, 
  onScroll 
}: { 
  data: string[], 
  selectedValue: string,
  onScroll: (event: any) => void
}) => {
  const flatListRef = useRef<FlatList>(null)
  useEffect(() => {
    const index = data.indexOf(selectedValue)
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: index * ITEM_HEIGHT, animated: false })
    }
  }, [])

  return (
    <View style={{ height: ITEM_HEIGHT * 5 }} className="w-20">
      <FlatList
        ref={flatListRef}
        data={getPaddedData(data)}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => {
          if (item === '') return <View style={{ height: ITEM_HEIGHT }} />
          return <PickerItem item={item} isSelected={selectedValue === item} />
        }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
      />
      <View pointerEvents="none" style={{ height: ITEM_HEIGHT, top: ITEM_HEIGHT * 2 }} className="absolute left-0 right-0 border-y border-white/10 bg-white/5" />
    </View>
  )
})

export default function HabitAlertsScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const insets = useSafeAreaInsets()

  const [reminders, setReminders] = useState<string[]>(
    params.reminders ? (params.reminders as string).split(',') : []
  )
  const [isPickerVisible, setIsPickerVisible] = useState(false)
  const [tempHour, setTempHour] = useState('08')
  const [tempMin, setTempMin] = useState('00')

  const handleAddReminder = () => {
    const newRem = `${tempHour}:${tempMin}`
    if (!reminders.includes(newRem)) {
      setReminders([...reminders, newRem].sort())
    }
    setIsPickerVisible(false)
  }

  const removeReminder = (rem: string) => {
    setReminders(reminders.filter(r => r !== rem))
  }

  const handleSave = () => {
    router.navigate({
      pathname: '/habit-config',
      params: { ...params, reminders: reminders.join(',') }
    })
  }

  const handleScroll = (type: 'h' | 'm', event: any) => {
    const y = event.nativeEvent.contentOffset.y
    const index = Math.round(y / ITEM_HEIGHT)
    const data = type === 'h' ? HOURS : MINUTES
    const selected = data[index]
    if (selected) {
      const current = type === 'h' ? tempHour : tempMin
      if (selected !== current) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        if (type === 'h') setTempHour(selected)
        else setTempMin(selected)
      }
    }
  }

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#0A0A0A]">
      <View className="px-5 py-4 flex-row items-center border-b border-white/5">
        <Pressable onPress={handleSave} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text className="text-white text-xl font-bold">Alerts</Text>
      </View>

      <View className="px-5 pt-8 gap-5">
        <Text className="text-zinc-500">Get notified when it's time to work on your habit.</Text>
        
        {reminders.map(rem => (
          <View key={rem} className="flex-row items-center justify-between py-4 border-b border-white/5">
            <Text className="text-white text-2xl font-bold">{rem}</Text>
            <Pressable onPress={() => removeReminder(rem)}>
              <Ionicons name="close-circle" size={24} color="#EF5350" />
            </Pressable>
          </View>
        ))}

        <Pressable 
          onPress={() => setIsPickerVisible(true)}
          className="flex-row items-center gap-3 py-4"
        >
          <Ionicons name="add" size={24} color="#3b82f6" />
          <Text className="text-[#3b82f6] text-lg font-bold">Add Reminder</Text>
        </Pressable>
      </View>

      <Modal visible={isPickerVisible} transparent animationType="fade">
        <Pressable className="flex-1 bg-black/80 items-center justify-center p-5" onPress={() => setIsPickerVisible(false)}>
          <Pressable className="bg-[#1C1C1E] w-full rounded-3xl p-6 border border-white/10" onPress={e => e.stopPropagation()}>
            <Text className="text-white text-xl font-bold mb-8 text-center">Set Time</Text>
            <View className="flex-row justify-center items-center gap-4 mb-10">
              <TimePickerColumn data={HOURS} selectedValue={tempHour} onScroll={e => handleScroll('h', e)} />
              <Text className="text-white text-2xl font-bold">:</Text>
              <TimePickerColumn data={MINUTES} selectedValue={tempMin} onScroll={e => handleScroll('m', e)} />
            </View>
            <Pressable onPress={handleAddReminder} className="bg-[#3b82f6] py-4 rounded-xl items-center">
              <Text className="text-white font-bold text-lg">Confirm</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}
