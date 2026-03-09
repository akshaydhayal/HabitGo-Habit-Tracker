import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import {
  ScrollView,
  Text,
  View,
  Pressable,
  Dimensions,
  Image,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 48) / 2

const SUGGESTIONS = [
  { id: 'smoking', title: 'Stop Smoking', color: '#E87A7A', icon: 'flame' },
  { id: 'drinking', title: 'Stop Drinking', color: '#F8B673', icon: 'wine' },
  { id: 'junk-food', title: 'Limit Junk Food', color: '#BDB455', icon: 'fast-food' },
  { id: 'overeating', title: 'Limit Overeating', color: '#7AAAF8', icon: 'restaurant' },
  { id: 'screen-time', title: 'Limit Screen Time', color: '#68BBE3', icon: 'smartphone' },
  { id: 'video-games', title: 'Limit Video Game', color: '#668EF8', icon: 'game-controller' },
  { id: 'shopping', title: 'Limit Shopping', color: '#B088F8', icon: 'cart' },
  { id: 'nail-biting', title: 'Limit Nail Biting', color: '#F8965E', icon: 'hand-right' },
  { id: 'masturbation', title: 'Limit Masturbation', color: '#E87A5E', icon: 'heart' },
  { id: 'time-sitting', title: 'Limit Time Sitting', color: '#808080', icon: 'walk' },
  { id: 'skipping-meals', title: 'Stop Skipping Meals', color: '#68B48F', icon: 'nutrition' },
  { id: 'staying-up-late', title: 'Stop Staying Up Late', color: '#3A3A3C', icon: 'moon' },
]

export default function BreakBadHabitScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#0A0A0A]">
      <View className="px-5 py-4 flex-row items-center border-b border-white/5">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Ionicons name="close" size={28} color="white" />
        </Pressable>
        <Text className="text-white text-xl font-bold">Break Bad Habit</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="mb-6"
        >
          <View className="flex-row gap-6 border-b border-white/5 pb-2">
             <Text className="text-[#3b82f6] font-bold text-base">Suggested</Text>
             <Text className="text-[#71717a] font-medium text-base">Health Connect</Text>
             <Text className="text-[#71717a] font-medium text-base">Fitness</Text>
          </View>
        </ScrollView>

        <View className="flex-row flex-wrap justify-between gap-y-4 pb-20">
          {SUGGESTIONS.map((item) => (
            <Pressable
              key={item.id}
              style={{ width: CARD_WIDTH, height: CARD_WIDTH * 1.2 }}
              onPress={() => router.push({
                pathname: '/habit-config',
                params: { 
                  name: item.title, 
                  color: item.color, 
                  icon: item.icon,
                  type: 'bad'
                }
              })}
              className="rounded-2xl overflow-hidden p-4 relative"
            >
               <View 
                 style={{ backgroundColor: item.color }} 
                 className="absolute inset-0 opacity-80" 
               />
               <Text className="text-white font-bold text-lg leading-6 pr-4">
                 {item.title}
               </Text>
               <View className="absolute bottom-4 right-4 opacity-30">
                  <Ionicons name={item.icon as any} size={64} color="white" />
               </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View className="absolute bottom-8 left-6 right-6">
        <Pressable className="bg-[#3b82f6] py-4 rounded-xl items-center shadow-lg shadow-[#3b82f6]/40">
           <Text className="text-white font-bold text-lg">Create Your Own</Text>
        </Pressable>
      </View>
    </View>
  )
}
