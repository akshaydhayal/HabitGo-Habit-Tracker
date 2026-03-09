import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import React, { useState, useRef, useEffect, memo } from 'react'
import {
  Text,
  View,
  Pressable,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const ITEM_HEIGHT = 60
const VISIBLE_ITEMS = 5
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS

const UNITS = ['times', 'hours', 'minutes', 'steps', 'litres', 'cups', 'km', 'meter', 'kcal', 'cal']
const FREQUENCIES = ['per day', 'per week', 'per month', 'per year']
const VALUES = Array.from({ length: 100 }, (_, i) => (i + 1).toString())

// Add padding to lists to allow centering first and last items
const getPaddedData = (data: string[]) => ['', '', ...data, '', '']

const PickerItem = memo(({ item, isSelected }: { item: string, isSelected: boolean }) => (
  <View style={{ height: ITEM_HEIGHT }} className="items-center justify-center">
    <Text className={`text-xl font-bold transition-all duration-75 ${
      isSelected ? 'text-white scale-125' : 'text-[#71717a] opacity-100 scale-100'
    }`}>
      {item}
    </Text>
  </View>
))

const PickerColumn = memo(({ 
  data, 
  selectedValue, 
  onScroll 
}: { 
  data: string[], 
  selectedValue: string,
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
}) => {
  const flatListRef = useRef<FlatList>(null)
  
  // Only scroll on initial mount
  useEffect(() => {
    const index = data.indexOf(selectedValue)
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: index * ITEM_HEIGHT, animated: false })
    }
  }, [])

  return (
    <View style={{ height: PICKER_HEIGHT }} className="flex-1 relative">
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
        decelerationRate={0.998} // Standard momentum for long jumps
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
      />
      {/* Selection Highlight Overlays */}
      <View 
        pointerEvents="none" 
        style={{ height: ITEM_HEIGHT, top: ITEM_HEIGHT * 2 }} 
        className="absolute left-0 right-0 border-y border-white/10 bg-white/5" 
      />
    </View>
  )
})

export default function HabitLimitScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const insets = useSafeAreaInsets()
  
  const [val, setVal] = useState(params.goalValue?.toString() || '1')
  const [unit, setUnit] = useState(params.goalUnit?.toString() || 'times')
  const [freq, setFreq] = useState(params.goalFrequency?.toString() || 'per week')

  const handleSave = () => {
    router.navigate({
      pathname: '/habit-config',
      params: { 
        ...params, 
        badHabitType: 'limit',
        goalValue: val,
        goalUnit: unit,
        goalFrequency: freq
      }
    })
  }

  const handleScroll = (type: 'val' | 'unit' | 'freq', event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y
    const index = Math.round(y / ITEM_HEIGHT)
    
    let selected = ''
    if (type === 'val') selected = VALUES[index]
    else if (type === 'unit') selected = UNITS[index]
    else if (type === 'freq') selected = FREQUENCIES[index]

    if (selected) {
      const current = type === 'val' ? val : type === 'unit' ? unit : freq
      if (selected !== current) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        if (type === 'val') setVal(selected)
        else if (type === 'unit') setUnit(selected)
        else if (type === 'freq') setFreq(selected)
      }
    }
  }

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#0A0A0A]">
      <View className="px-5 py-4 flex-row items-center justify-between border-b border-white/5">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="text-white text-xl font-bold">Goal</Text>
        </View>
        <Pressable onPress={handleSave}>
          <Text className="text-[#3b82f6] font-bold text-lg">Save</Text>
        </Pressable>
      </View>

      <View className="px-5 pt-8 gap-4 border-b border-white/5 pb-8 mb-10">
        <View className="flex-row items-center gap-4">
          <Ionicons name="arrow-down-outline" size={24} color="#71717a" />
          <Text className="text-white text-lg font-medium">No More Than</Text>
        </View>
      </View>

      <View className="flex-row items-center justify-center">
        <View style={{ height: PICKER_HEIGHT }} className="flex-row w-full">
          <PickerColumn 
            data={VALUES} 
            selectedValue={val} 
            onScroll={(e) => handleScroll('val', e)} 
          />
          <PickerColumn 
            data={UNITS} 
            selectedValue={unit} 
            onScroll={(e) => handleScroll('unit', e)} 
          />
          <PickerColumn 
            data={FREQUENCIES} 
            selectedValue={freq} 
            onScroll={(e) => handleScroll('freq', e)} 
          />
        </View>
      </View>
    </View>
  )
}
