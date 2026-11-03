import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useChat } from '../context/ChatContext';

export default function NotificationBanner() {
  const { theme } = useTheme();
  const { notification, dismissNotification, openConversation } = useChat();
  const router = useRouter();

  if (!notification) return null;

  const handlePress = async () => {
    const convoId = notification.conversationId;
    dismissNotification();
    await openConversation(convoId);
    router.push({ pathname: '/chat/[id]', params: { id: convoId } });
  };

  return (
    <View style={[styles.container, { backgroundColor: '#1A2F3D', borderColor: theme.primary }]}>
      <View style={styles.leftRow}>
        <View style={[styles.iconCircle, { backgroundColor: theme.primaryMuted }]}>
          <Ionicons name="chatbubble-ellipses" size={16} color={theme.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.sender, { color: theme.primary }]}>
            {notification.senderName}
          </Text>
          <Text style={[styles.snippet, { color: theme.text }]} numberOfLines={1}>
            {notification.content}
          </Text>
          <Text style={[styles.timerBadge, { color: theme.warning }]}>
            ⚡ Disappears in 60s
          </Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={handlePress}
          style={[styles.openBtn, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.openBtnText}>Reply</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={dismissNotification} style={styles.closeBtn}>
          <Ionicons name="close" size={16} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 55,
    left: 14,
    right: 14,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#00F5A0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textContainer: {
    flex: 1
  },
  sender: {
    fontSize: 13,
    fontWeight: '700'
  },
  snippet: {
    fontSize: 12,
    marginTop: 1
  },
  timerBadge: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 10
  },
  openBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  openBtnText: {
    color: '#090B10',
    fontSize: 12,
    fontWeight: '700'
  },
  closeBtn: {
    padding: 4
  }
});
