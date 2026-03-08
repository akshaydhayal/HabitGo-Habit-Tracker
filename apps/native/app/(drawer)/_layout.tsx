import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { Drawer } from 'expo-router/drawer'
import { useThemeColor } from 'heroui-native'
import { useCallback } from 'react'
import { Pressable, Text } from 'react-native'

import { ThemeToggle } from '@/components/theme-toggle'
import { authClient } from '@/lib/auth-client'

function DrawerLayout() {
  const themeColorForeground = useThemeColor('foreground')
  const themeColorBackground = useThemeColor('background')
  const { data: session } = authClient.useSession()

  const renderThemeToggle = useCallback(() => <ThemeToggle />, [])
  const isFullyOnboarded = session?.user && (session.user as any).dob

  return (
    <Drawer
      screenOptions={{
        headerTintColor: themeColorForeground,
        headerStyle: { backgroundColor: themeColorBackground },
        headerTitleStyle: {
          fontWeight: '600',
          color: themeColorForeground,
        },
        headerRight: renderThemeToggle,
        drawerStyle: { backgroundColor: themeColorBackground },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          headerTitle: 'Home',
          drawerLabel: ({ color, focused }) => (
            <Text style={{ color: focused ? color : themeColorForeground }}>
              Home
            </Text>
          ),
          drawerIcon: ({ size, color, focused }) => (
            <Ionicons
              name="home-outline"
              size={size}
              color={focused ? color : themeColorForeground}
            />
          ),
        }}
      />
      {/* Only show the Habits screen to users who are logged in and have finished onboarding */}
      <Drawer.Screen
        name="habits"
        options={{
          headerTitle: 'Habits Tracker',
          drawerItemStyle: isFullyOnboarded ? undefined : { display: 'none' },
          drawerLabel: ({ color, focused }) => (
            <Text style={{ color: focused ? color : themeColorForeground }}>
              Habits Tracker
            </Text>
          ),
          drawerIcon: ({ size, color, focused }) => (
            <Ionicons
              name="calendar-clear-outline"
              size={size}
              color={focused ? color : themeColorForeground}
            />
          ),
        }}
      />

      {/* Hide Tabs, AI, and Solana examples for cleaner UI production flow */}
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerItemStyle: { display: 'none' },
          headerTitle: 'Tabs',
        }}
      />
      <Drawer.Screen
        name="ai"
        options={{
          drawerItemStyle: { display: 'none' },
          headerTitle: 'AI',
        }}
      />
      <Drawer.Screen
        name="solana"
        options={{
          drawerItemStyle: { display: 'none' },
          headerTitle: 'Solana',
        }}
      />
    </Drawer>
  )
}

export default DrawerLayout
