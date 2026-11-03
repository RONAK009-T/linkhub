import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Message } from '../types';
import CountdownTimer from './CountdownTimer';

interface MessageBubbleProps {
  message: Message;
  onDelete?: (id: number) => void;
}

export default function MessageBubble({ message, onDelete }: MessageBubbleProps) {
  const { theme } = useTheme();
  const isMine = Boolean(message.is_mine);

  const formattedTime = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <View style={[styles.wrapper, isMine ? styles.myWrapper : styles.otherWrapper]}>
      {/* Sender Avatar for other users */}
      {!isMine && (
        <Image
          source={{ uri: message.sender_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }}
          style={styles.avatar}
        />
      )}

      <View
        style={[
          styles.bubble,
          isMine
            ? [styles.myBubble, { backgroundColor: '#1A2F3D', borderColor: theme.primary, borderBottomRightRadius: 4 }]
            : [styles.otherBubble, { backgroundColor: theme.card, borderColor: theme.cardBorder, borderBottomLeftRadius: 4 }]
        ]}
      >
        {/* Header row: Sender name & Countdown timer */}
        <View style={styles.bubbleHeader}>
          <Text style={[styles.senderName, { color: isMine ? theme.primary : theme.secondary }]}>
            {isMine ? 'You' : message.sender_name || message.sender_username}
          </Text>

          <CountdownTimer remainingSeconds={message.remaining_seconds} />
        </View>

        {/* Message Content */}
        <Text style={[styles.messageText, { color: theme.text }]}>
          {message.content}
        </Text>

        {/* Footer row: Timestamp & Immediate Delete Button */}
        <View style={styles.bubbleFooter}>
          <Text style={[styles.timestamp, { color: theme.textSecondary }]}>
            {formattedTime}
          </Text>

          <View style={styles.actionRow}>
            {onDelete && (
              <TouchableOpacity
                onPress={() => onDelete(message.id)}
                style={styles.deleteButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Delete immediately"
              >
                <Ionicons name="trash-outline" size={13} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
            {isMine && <Ionicons name="checkmark-done" size={14} color={theme.primary} />}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 6,
    paddingHorizontal: 12,
    gap: 8
  },
  myWrapper: {
    justifyContent: 'flex-end'
  },
  otherWrapper: {
    justifyContent: 'flex-start'
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 4
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6
  },
  myBubble: {
    borderWidth: 1
  },
  otherBubble: {
    borderWidth: 1
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 2
  },
  senderName: {
    fontSize: 12,
    fontWeight: '700'
  },
  messageText: {
    fontSize: 14.5,
    lineHeight: 20
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.08)'
  },
  timestamp: {
    fontSize: 10
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  deleteButton: {
    padding: 2
  }
});
