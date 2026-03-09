import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import {
  ScrollView,
  Text,
  View,
  Pressable,
  Dimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 48) / 2

const SUGGESTIONS = [
  { id: 'meditate', title: 'Meditate', color: '#7AAAF8', icon: 'leaf' },
  { id: 'running', title: 'Running', color: '#E87A7A', icon: 'fitness' },
  { id: 'read-books', title: 'Read Books', color: '#F8B673', icon: 'book' },
  { id: 'journal', title: 'Write in Journal', color: '#BDB455', icon: 'pencil' },
  { id: 'todo-list', title: 'Set a To-do List', color: '#68BBE3', icon: 'list' },
  { id: 'gym', title: 'Hit the Gym', color: '#668EF8', icon: 'barbell' },
  { id: 'swimming', title: 'Swimming', color: '#4FC3F7', icon: 'water' },
  { id: 'coretraining', title: 'Coretraining', color: '#8884d8', icon: 'body' },
  { id: 'yoga', title: 'Practise Yoga', color: '#CE93D8', icon: 'accessibility' },
  { id: 'cardio', title: 'Hit Cardio', color: '#EF5350', icon: 'heart' },
  { id: 'cycling', title: 'Cycling', color: '#FFA726', icon: 'bicycle' },
  { id: 'walk', title: 'Go for a Walk', color: '#66BB6A', icon: 'walk' },
  { id: 'water', title: 'Drink Water', color: '#29B6F6', icon: 'water' },
  { id: 'sleep', title: 'Get Good Sleep', color: '#5C6BC0', icon: 'moon' },
  { id: 'limit-sugar', title: 'Limit Sugar', color: '#FF7043', icon: 'cube' },
  { id: 'fruits', title: 'Eat Fruits', color: '#9CCC65', icon: 'nutrition' },
  { id: 'limit-caffeine', title: 'Limit Caffeine', color: '#8D6E63', icon: 'cafe' },
  { id: 'coding', title: 'Practise Coding', color: '#26A69A', icon: 'code' },
  { id: 'dance', title: 'Just Dance', color: '#EC407A', icon: 'musical-notes' },
  { id: 'sports', title: 'Play Sports', color: '#FFCA28', icon: 'football' },
  { id: 'lift-weight', title: 'Lift Weight', color: '#78909C', icon: 'barbell' },
  { id: 'exercise-time', title: 'Exercise Time', color: '#26C6DA', icon: 'timer' },
  { id: 'protein', title: 'Protein Intake', color: '#D4E157', icon: 'restaurant' },
]

export default function BuildGoodHabitScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#0A0A0A]">
      <View className="px-5 py-4 flex-row items-center border-b border-white/5">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Ionicons name="close" size={28} color="white" />
        </Pressable>
        <Text className="text-white text-xl font-bold">Build Good Habit</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
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
                  type: 'good'
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
        <Pressable 
          onPress={() => router.push({
            pathname: '/habit-config',
            params: { type: 'good' }
          })}
          className="bg-[#3b82f6] py-4 rounded-xl items-center shadow-lg shadow-[#3b82f6]/40"
        >
           <Text className="text-white font-bold text-lg">Create Your Own</Text>
        </Pressable>
      </View>
    </View>
  )
}
