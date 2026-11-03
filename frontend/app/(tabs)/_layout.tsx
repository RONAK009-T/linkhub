import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useChat } from '../../src/context/ChatContext';

export default function TabsLayout() {
  const { theme } = useTheme();
  const { conversations } = useChat();

  // Calculate total active temporary messages across chats
  const totalActiveMessages = conversations.reduce((acc, c) => acc + (c.active_messages || 0), 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.secondaryBackground,
          borderTopColor: theme.cardBorder,
          height: Platform.OS === 'ios' ? 86 : 64,
          paddingBottom: Platform.OS === 'ios' ? 26 : 10,
          paddingTop: 8
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600'
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size || 22} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarBadge: totalActiveMessages > 0 ? totalActiveMessages : undefined,
          tabBarBadgeStyle: {
            backgroundColor: theme.primary,
            color: '#090B10',
            fontSize: 10,
            fontWeight: 'bold'
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size || 22} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size || 22} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="games"
        options={{
          title: 'Games',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="game-controller-outline" size={size || 22} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size || 22} color={color} />
          )
        }}
      />
    </Tabs>
  );
}
