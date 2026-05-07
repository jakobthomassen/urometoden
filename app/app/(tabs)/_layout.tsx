import { View } from 'react-native'
import { Tabs } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTheme } from '@/components/ui/ThemeContext'
import { PlayerProvider } from '@/context/PlayerContext'
import MiniPlayer from '@/components/player/MiniPlayer'
import FullPlayer from '@/components/player/FullPlayer'

function TabsContent() {
  const { colors } = useTheme()

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor:   colors.primary,
          tabBarInactiveTintColor: colors.mutedText,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor:  colors.border,
            height:          88,
            paddingTop:      10,
            paddingBottom:   24,
          },
          tabBarLabelStyle: {
            fontSize:   12,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="hjem"
          options={{
            title: 'Hjem',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="reise"
          options={{
            title: 'Uropraksis',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="lydbibliotek"
          options={{
            title: 'Lydbibliotek',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="headset-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="kurs"
          options={{
            title: 'Kurs',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="book-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profil"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      <MiniPlayer />
      <FullPlayer />
    </View>
  )
}

export default function TabsLayout() {
  return (
    <PlayerProvider>
      <TabsContent />
    </PlayerProvider>
  )
}
