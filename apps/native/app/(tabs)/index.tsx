import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { useState, useRef } from 'react'
import {
  ScrollView,
  Text,
  View,
  Pressable,
  Dimensions,
} from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Container } from '@/components/container'
import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'
import { HabitActionSheet } from '@/components/habit-action-sheet'

const FILTERS = [
  { id: 'all', label: 'All Habits', icon: 'briefcase' },
  { id: 'morning', label: 'Morning', icon: 'sunny' },
  { id: 'afternoon', label: 'Afternoon', icon: 'sunny' },
  { id: 'new', label: 'New', icon: 'add' },
]

const MOOD_EMOJIS: Record<string, string> = {
  'Terrible': '😣',
  'Bad': '😕',
  'Okay': '😐',
  'Good': '😊',
  'Excellent': '🤩',
}

export default function JournalScreen() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [isActionSheetVisible, setIsActionSheetVisible] = useState(false)
  const { data: habits, isLoading: isLoadingHabits } = useQuery(orpc.habits.getAll.queryOptions())
  const { data: moods, isLoading: isLoadingMoods } = useQuery(orpc.moods.getAll.queryOptions({ date: selectedDate }))
  const { data: session } = authClient.useSession()
  const scrollRef = useRef<ScrollView>(null)
  const insets = useSafeAreaInsets()

  const dates = useRef(
    Array.from({ length: 30 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (29 - i))
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        date: d.getDate().toString(),
        fullDate: d.toISOString().split('T')[0],
      }
    })
  ).current

  const visibleHabits = habits?.filter(h => h.startDate <= selectedDate) || []
  
  const negativeHabits = visibleHabits.filter(h => 
    h.type === 'bad' || 
    h.name.toLowerCase().startsWith('limit') || 
    h.name.toLowerCase().startsWith('stop')
  )
  const goodHabits = visibleHabits.filter(h => h.type === 'good' && !negativeHabits.find(nh => nh._id === h._id))

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#0A0A0A]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-8 mb-6">
          <Text className="text-[#71717a] text-[11px] font-bold tracking-widest uppercase mb-1">
            TODAY
          </Text>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2">
              <Text className="text-white text-[32px] font-bold">My Journal</Text>
              <Ionicons name="pencil" size={20} color="#71717a" />
            </View>
            <View className="flex-row items-center gap-4">
              <Pressable className="bg-zinc-800 h-10 w-10 rounded-full items-center justify-center">
                <Ionicons name="school" size={20} color="#FFFFFF" />
              </Pressable>
              <Pressable className="bg-zinc-800 h-10 w-10 rounded-full items-center justify-center">
                <Ionicons name="stats-chart" size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Filter Bar */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="mb-6 px-5"
          contentContainerStyle={{ paddingRight: 40 }}
        >
          {FILTERS.map((filter) => (
            <Pressable
              key={filter.id}
              onPress={() => setActiveFilter(filter.id)}
              className={`flex-row items-center gap-2 px-4 py-2.5 rounded-full mr-3 border ${
                activeFilter === filter.id 
                  ? 'bg-[#3b82f6] border-[#3b82f6]' 
                  : 'bg-transparent border-zinc-800'
              }`}
            >
              <Ionicons 
                name={filter.icon as any} 
                size={18} 
                color={activeFilter === filter.id ? 'white' : '#71717a'} 
              />
              <Text className={`font-semibold ${activeFilter === filter.id ? 'text-white' : 'text-[#71717a]'}`}>
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Info Card */}
        <View className="px-5 mb-8">
          <View className="bg-[#1C1C1E] rounded-xl p-4 flex-row gap-3 relative border border-white/5">
            <Ionicons name="information-circle" size={20} color="#71717a" />
            <Text className="flex-1 text-gray-400 text-[13px] leading-5 pr-4">
              When the day has passed and the log value is zero or below the limit, a bad habit will automatically be marked a success.
            </Text>
            <Pressable className="absolute top-2 right-2">
              <Ionicons name="close" size={18} color="#71717a" />
            </Pressable>
          </View>
        </View>

        {/* Habit List */}
        <View className="px-5 gap-8">
           {goodHabits.length > 0 ? (
             <View>
                {goodHabits.map((h) => (
                  <View key={String(h._id)} className="flex-row items-center gap-3 mb-6">
                    <View 
                      style={{ backgroundColor: `${h.color || '#3b82f6'}15`, borderColor: `${h.color || '#3b82f6'}30` }}
                      className="h-10 w-10 rounded-full items-center justify-center border"
                    >
                      <Ionicons name="leaf" size={20} color={h.color || '#3b82f6'} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-bold text-lg">{h.name}</Text>
                      <Text className="text-[#71717a] text-sm">0/1 {h.frequency?.join(', ')}</Text>
                    </View>
                    <Pressable className="flex-row items-center gap-2 border border-white rounded-full px-4 py-2">
                      <Ionicons name="timer-outline" size={18} color="white" />
                      <Text className="text-white font-bold">Timer</Text>
                    </Pressable>
                  </View>
                ))}
             </View>
           ) : !isLoadingHabits && selectedDate === new Date().toISOString().split('T')[0] && (
             <Text className="text-gray-500 text-center py-4">No good habits for today</Text>
           )}

           {negativeHabits.length > 0 && (
             <View>
               <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-white font-bold text-xl">{negativeHabits.length} Negative Habit{negativeHabits.length > 1 ? 's' : ''}</Text>
                  <Ionicons name="chevron-up" size={20} color="#71717a" />
               </View>

               {negativeHabits.map((h) => (
                 <View key={String(h._id)} className="flex-row items-center gap-3 mb-6 opacity-80">
                    <View 
                      style={{ backgroundColor: `${h.color || '#FF9500'}15`, borderColor: `${h.color || '#FF9500'}30` }}
                      className="h-10 w-10 rounded-full items-center justify-center border"
                    >
                       <Ionicons name={h.badHabitType === 'stop' ? "ban" : "arrow-down"} size={20} color={h.color || '#FF9500'} />
                    </View>
                    <View className="flex-1">
                       <Text className="text-white font-bold text-lg">{h.name}</Text>
                       <Text className="text-[#71717a] text-sm">
                         {h.badHabitType === 'stop' ? 'Quit this habit' : `0/${h.goalValue} ${h.goalUnit} ${h.goalFrequency}`}
                       </Text>
                    </View>
                    <Pressable className="flex-row items-center gap-2 border border-white rounded-full px-4 py-2">
                       <Ionicons name="checkmark" size={18} color="white" />
                       <Text className="text-white font-bold">Succeed</Text>
                    </Pressable>
                 </View>
               ))}
             </View>
           )}

           <View>
             {/* Mood Section */}
             <View className="flex-row items-center justify-between mb-4 mt-8">
                <Text className="text-white font-bold text-xl">{moods?.length || 0} Mood Logged</Text>
                <Ionicons name="chevron-up" size={20} color="#71717a" />
             </View>

             {(moods || []).map((m) => (
               <Pressable 
                 key={m._id} 
                 onPress={() => router.push({
                   pathname: '/mood-detail',
                   params: {
                     mood: m.mood,
                     date: m.date,
                     time: m.time,
                     activities: m.activities.join(','),
                     context: m.context
                   }
                 })}
                 className="flex-row items-center gap-3 mb-6"
               >
                  <View className="h-10 w-10 rounded-full bg-zinc-800 items-center justify-center">
                     <Text style={{ fontSize: 24 }}>{MOOD_EMOJIS[m.mood]}</Text>
                  </View>
                  <View className="flex-1">
                     <Text className="text-white font-bold text-lg">{m.mood}</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                     <Ionicons name="document-text" size={14} color="#71717a" />
                     <Text className="text-gray-500 text-sm">{m.time}</Text>
                  </View>
               </Pressable>
             ))}
           </View>

          {/* Swipe Tip Card */}
          <View className="bg-[#1C1C1E] rounded-xl p-5 border border-white/5 mb-28">
             <View className="flex-row justify-between mb-2">
                <Text className="text-white font-bold text-lg">Quick Actions with Swipes</Text>
                <Ionicons name="close" size={20} color="#71717a" />
             </View>
             <View className="flex-row gap-4 items-center">
                <Ionicons name="hand-right" size={32} color="#71717a" />
                <Text className="flex-1 text-gray-400 leading-5">
                   Swipe left to complete or log your habit. Swipe right to skip, mark as failed, or add a note
                </Text>
             </View>
             <Text className="text-[#3b82f6] font-bold mt-4">Quick Actions with Swipes</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Date Strip and FAB */}
      <View className="absolute bottom-4 left-0 right-0 px-5 flex-row items-center justify-between">
         <View className="flex-1 mr-4 bg-zinc-900/90 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 12, gap: 10 }}
              ref={scrollRef}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
            >
               {dates.map((d, i) => (
                 <Pressable 
                   key={i} 
                   onPress={() => setSelectedDate(d.fullDate)}
                   className={`items-center px-4 py-1.5 rounded-xl ${selectedDate === d.fullDate ? 'bg-zinc-800 border border-white/10' : ''}`}
                 >
                   <Text className={`text-[10px] mb-1 font-bold ${selectedDate === d.fullDate ? 'text-[#3b82f6]' : 'text-[#71717a]'}`}>
                     {d.day}
                   </Text>
                   <Text className={`text-base font-bold ${selectedDate === d.fullDate ? 'text-white' : 'text-[#71717a]'}`}>
                     {d.date}
                   </Text>
                 </Pressable>
               ))}
            </ScrollView>
         </View>
         <Pressable 
           onPress={() => setIsActionSheetVisible(true)}
           className="h-16 w-16 bg-[#3b82f6] rounded-full items-center justify-center shadow-xl shadow-[#3b82f6]/40"
         >
            <Ionicons name="add" size={40} color="white" />
         </Pressable>
      </View>

      <HabitActionSheet 
        isVisible={isActionSheetVisible} 
        onClose={() => setIsActionSheetVisible(false)} 
      />
    </View>
  )
}
