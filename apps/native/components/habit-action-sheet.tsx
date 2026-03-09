import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { Modal, Pressable, Text, View, StyleSheet } from 'react-native'
import Animated, { FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated'

interface HabitActionSheetProps {
  isVisible: boolean
  onClose: () => void
}

export const HabitActionSheet = ({ isVisible, onClose }: HabitActionSheetProps) => {
  const router = useRouter()
  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Animated.View 
            entering={FadeIn} 
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.7)' }]} 
          />
        </Pressable>

        <Animated.View 
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(200)}
          style={styles.sheet}
        >
          <View style={styles.handle} />
          
          <View className="px-6 pt-2 pb-10 gap-4">
             <Pressable 
               className="flex-row items-center gap-4 py-0 active:opacity-60"
               onPress={onClose}
             >
                <View className="h-10 w-10 rounded-full bg-[#3b82f6] items-center justify-center">
                   <Ionicons name="leaf" size={24} color="white" />
                </View>
                <Text className="text-white text-xl font-semibold">Create Good Habit</Text>
             </Pressable>

             <Pressable 
               className="flex-row items-center gap-4 py-0 active:opacity-60"
               onPress={() => {
                 onClose()
                 router.push('/break-bad-habit')
               }}
             >
                <View className="h-10 w-10 rounded-full bg-zinc-600 items-center justify-center">
                   <Ionicons name="ban" size={28} color="white" />
                </View>
                <Text className="text-white text-xl font-semibold">Break Bad Habit</Text>
             </Pressable>

             <Pressable 
               className="flex-row items-center gap-4 py-0 active:opacity-60"
               onPress={() => {
                 onClose()
                 router.push('/log-mood')
               }}
             >
                <View className="h-10 w-10 rounded-full bg-orange-900 items-center justify-center">
                   <Ionicons name="happy" size={36} color="#FF9500" />
                </View>
                <Text className="text-white text-xl font-semibold">Log mood</Text>
             </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
  },
  handle: {
    width: 40,
    height: 4.5,
    backgroundColor: '#3A3A3C',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  }
})
