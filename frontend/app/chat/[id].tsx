import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useChat } from '../../src/context/ChatContext';
import MessageBubble from '../../src/components/MessageBubble';
import { Message } from '../../src/types';

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams();
  const conversationId = Number(id);
  const router = useRouter();

  const { theme } = useTheme();
  const {
    conversations,
    messages,
    isLoadingMessages,
    openConversation,
    closeConversation,
    sendMessage,
    deleteMessage,
    clearConversation,
    typingUsers,
    startTyping,
    stopTyping
  } = useChat();

  const [inputContent, setInputContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Find current conversation metadata
  const conversation = conversations.find((c) => c.id === conversationId);

  useEffect(() => {
    if (conversationId) {
      openConversation(conversationId);
    }
    return () => {
      closeConversation();
    };
  }, [conversationId]);

  // Scroll to end when messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleTextChange = (text: string) => {
    setInputContent(text);
    startTyping();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1500);
  };

  const handleSend = async () => {
    if (!inputContent.trim() || isSending) return;
    const text = inputContent.trim();
    setInputContent('');
    stopTyping();

    try {
      setIsSending(true);
      await sendMessage(text);
    } catch (e: any) {
      Alert.alert('Send Error', e.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClearConversation = () => {
    const performClear = async () => {
      try {
        await clearConversation();
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to clear conversation.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to permanently clear all messages in this conversation immediately?')) {
        performClear();
      }
    } else {
      Alert.alert(
        'Clear Conversation',
        'Permanently delete all active messages right now?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear All', style: 'destructive', onPress: performClear }
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Chat Room Header */}
      <View style={[styles.header, { backgroundColor: theme.secondaryBackground, borderBottomColor: theme.cardBorder }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
              {conversation?.title || 'Temporary Chat'}
            </Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: conversation?.other_user?.status === 'online' ? theme.primary : theme.textMuted }
                ]}
              />
              <Text style={[styles.statusText, { color: theme.textSecondary }]}>
                {conversation?.is_group
                  ? `${conversation.members?.length || 0} participants`
                  : conversation?.other_user?.status === 'online'
                  ? 'Online'
                  : 'Offline'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleClearConversation}
            style={[styles.headerActionBtn, { backgroundColor: theme.card }]}
            accessibilityLabel="Clear Conversation"
          >
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 60s Expiration Warning Bar */}
      <View style={[styles.warningBar, { backgroundColor: '#131A29', borderBottomColor: theme.cardBorder }]}>
        <Ionicons name="timer-outline" size={15} color={theme.warning} />
        <Text style={[styles.warningBarText, { color: theme.textSecondary }]}>
          Temporary Chat: Every message disappears after <Text style={{ color: theme.primary, fontWeight: '700' }}>60 seconds</Text>.
        </Text>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <MessageBubble message={item} onDelete={deleteMessage} />
        )}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={
          <View style={styles.emptyMessages}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}>
              <Ionicons name="hourglass-outline" size={32} color={theme.primary} />
            </View>
            <Text style={[styles.emptyMessagesTitle, { color: theme.text }]}>
              Ephemeral Chat Room
            </Text>
            <Text style={[styles.emptyMessagesSubtitle, { color: theme.textSecondary }]}>
              No messages right now. Send a message to start a 60-second self-destructing conversation!
            </Text>
          </View>
        }
      />

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <View style={styles.typingRow}>
          <Ionicons name="ellipsis-horizontal" size={16} color={theme.primary} />
          <Text style={[styles.typingText, { color: theme.textSecondary }]}>
            {typingUsers.join(', ')} is typing...
          </Text>
        </View>
      )}

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputBar, { backgroundColor: theme.secondaryBackground, borderTopColor: theme.cardBorder }]}>
          <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <TextInput
              style={[styles.textInput, { color: theme.text }]}
              value={inputContent}
              onChangeText={handleTextChange}
              placeholder="Send temporary message (expires in 60s)..."
              placeholderTextColor={theme.textMuted}
              multiline
              maxLength={1000}
              onSubmitEditing={handleSend}
            />

            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputContent.trim() || isSending}
              style={[
                styles.sendButton,
                {
                  backgroundColor: inputContent.trim() ? theme.primary : theme.cardBorder,
                  opacity: inputContent.trim() ? 1 : 0.6
                }
              ]}
            >
              <Ionicons name="send" size={16} color="#090B10" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    paddingTop: Platform.OS === 'ios' ? 48 : 10
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  backBtn: {
    padding: 4
  },
  headerInfo: {
    flex: 1
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700'
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4
  },
  statusText: {
    fontSize: 11
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  warningBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1
  },
  warningBarText: {
    fontSize: 11
  },
  messagesList: {
    paddingVertical: 12,
    flexGrow: 1
  },
  emptyMessages: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 12,
    marginTop: 80
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyMessagesTitle: {
    fontSize: 18,
    fontWeight: '700'
  },
  emptyMessagesSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 4
  },
  typingText: {
    fontSize: 11,
    fontStyle: 'italic'
  },
  inputBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    maxHeight: 100,
    paddingVertical: 4
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
