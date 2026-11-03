import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { useChat } from '../../src/context/ChatContext';
import { api } from '../../src/services/api';
import Header from '../../src/components/Header';
import { Conversation, User } from '../../src/types';

export default function ChatListScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { conversations, loadConversations, openConversation } = useChat();
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Group creation modal state
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const handleSearchUsers = useCallback(async (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const res = await api.searchUsers(text.trim());
      setSearchResults(res.users || []);
    } catch (e) {
      console.warn('Failed to search users:', e);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleStartDirectChat = async (targetUser: User) => {
    try {
      const res = await api.createConversation({ recipientId: targetUser.id });
      const convoId = res.conversationId;
      setShowNewChatModal(false);
      setSearchQuery('');
      setSearchResults([]);
      if (convoId) {
        await openConversation(convoId);
        router.push({ pathname: '/chat/[id]', params: { id: convoId } });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to start conversation.');
    }
  };

  const handleCreateGroup = async () => {
    if (!groupTitle.trim()) {
      alert('Please enter a group title.');
      return;
    }
    if (selectedUserIds.length === 0) {
      alert('Please select at least one user.');
      return;
    }

    try {
      const res = await api.createConversation({
        isGroup: true,
        title: groupTitle.trim(),
        participantIds: selectedUserIds
      });
      setShowNewChatModal(false);
      setIsGroupMode(false);
      setGroupTitle('');
      setSelectedUserIds([]);
      if (res.conversation?.id) {
        await openConversation(res.conversation.id);
        router.push({ pathname: '/chat/[id]', params: { id: res.conversation.id } });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create group.');
    }
  };

  const toggleSelectUser = (id: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const isOnline = item.other_user?.status === 'online';

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={async () => {
          await openConversation(item.id);
          router.push({ pathname: '/chat/[id]', params: { id: item.id } });
        }}
        style={[styles.convoCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
      >
        <View style={styles.avatarWrapper}>
          <Image
            source={{
              uri:
                item.avatar_url ||
                (item.is_group
                  ? 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150'
                  : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150')
            }}
            style={styles.avatar}
          />
          {!item.is_group && (
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: isOnline ? theme.primary : theme.textMuted }
              ]}
            />
          )}
        </View>

        <View style={styles.convoDetails}>
          <View style={styles.titleRow}>
            <Text style={[styles.convoTitle, { color: theme.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            {item.last_message_time && (
              <Text style={[styles.timeText, { color: theme.textSecondary }]}>
                {new Date(item.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>

          <View style={styles.messageRow}>
            <Text style={[styles.lastMsg, { color: theme.textSecondary }]} numberOfLines={1}>
              {item.last_message || 'Temporary lounge ready'}
            </Text>

            {item.active_messages > 0 && (
              <View style={[styles.activePill, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}>
                <Ionicons name="timer" size={10} color={theme.primary} />
                <Text style={[styles.activePillText, { color: theme.primary }]}>
                  {item.active_messages} active
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        subtitle="Temporary 60s Social Chat"
        rightAction={
          <TouchableOpacity
            onPress={() => setShowNewChatModal(true)}
            style={[styles.headerNewBtn, { backgroundColor: theme.primary }]}
          >
            <Ionicons name="create-outline" size={16} color="#090B10" />
            <Text style={styles.headerNewBtnText}>New</Text>
          </TouchableOpacity>
        }
      />

      {/* Ephemeral Warning Banner */}
      <View style={[styles.noticeBanner, { backgroundColor: `${theme.primary}12`, borderColor: `${theme.primary}44` }]}>
        <Ionicons name="shield-checkmark-outline" size={16} color={theme.primary} />
        <Text style={[styles.noticeText, { color: theme.textSecondary }]}>
          Strict Privacy: All messages auto-expire and are hard-deleted on server after 60 seconds.
        </Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderConversationItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={56} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Conversations Yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Search registered users or create a temporary gaming lounge to start chatting.
            </Text>
            <TouchableOpacity
              onPress={() => setShowNewChatModal(true)}
              style={[styles.startChatBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.startChatBtnText}>Start New Temporary Chat</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* New Chat & User Search Modal */}
      <Modal visible={showNewChatModal} transparent animationType="slide" onRequestClose={() => setShowNewChatModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {isGroupMode ? 'Create Group Lounge' : 'New Temporary Chat'}
              </Text>
              <TouchableOpacity onPress={() => setShowNewChatModal(false)}>
                <Ionicons name="close" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Mode switch: 1-on-1 vs Group */}
            <View style={[styles.modeTabs, { backgroundColor: theme.secondaryBackground }]}>
              <TouchableOpacity
                onPress={() => setIsGroupMode(false)}
                style={[styles.modeTab, !isGroupMode && { backgroundColor: theme.card }]}
              >
                <Text style={[styles.modeTabText, { color: !isGroupMode ? theme.primary : theme.textSecondary }]}>
                  Direct Message
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsGroupMode(true)}
                style={[styles.modeTab, isGroupMode && { backgroundColor: theme.card }]}
              >
                <Text style={[styles.modeTabText, { color: isGroupMode ? theme.primary : theme.textSecondary }]}>
                  Group Lounge
                </Text>
              </TouchableOpacity>
            </View>

            {isGroupMode && (
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.secondaryBackground, borderColor: theme.cardBorder, color: theme.text }]}
                value={groupTitle}
                onChangeText={setGroupTitle}
                placeholder="Group Lounge Name (e.g. Apex Legends Squad)..."
                placeholderTextColor={theme.textMuted}
              />
            )}

            {/* User Search Input */}
            <View style={[styles.inputRow, { backgroundColor: theme.secondaryBackground, borderColor: theme.cardBorder }]}>
              <Ionicons name="search" size={18} color={theme.textSecondary} />
              <TextInput
                style={[styles.inputSearch, { color: theme.text }]}
                value={searchQuery}
                onChangeText={handleSearchUsers}
                placeholder="Search registered users by username..."
                placeholderTextColor={theme.textMuted}
                autoFocus
              />
              {isSearching && <ActivityIndicator size="small" color={theme.primary} />}
            </View>

            {/* Results List */}
            <FlatList
              data={searchResults}
              keyExtractor={(item) => String(item.id)}
              style={{ maxHeight: 260 }}
              renderItem={({ item }) => {
                const isSelected = selectedUserIds.includes(item.id);
                return (
                  <TouchableOpacity
                    onPress={() => (isGroupMode ? toggleSelectUser(item.id) : handleStartDirectChat(item))}
                    style={[
                      styles.userRow,
                      { borderBottomColor: theme.cardBorder },
                      isSelected && { backgroundColor: theme.primaryMuted }
                    ]}
                  >
                    <Image
                      source={{ uri: item.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }}
                      style={styles.userAvatar}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.userDisplayName, { color: theme.text }]}>
                        {item.display_name}
                      </Text>
                      <Text style={[styles.userUsername, { color: theme.textSecondary }]}>
                        @{item.username}
                      </Text>
                    </View>

                    {isGroupMode ? (
                      <Ionicons
                        name={isSelected ? 'checkbox' : 'square-outline'}
                        size={20}
                        color={isSelected ? theme.primary : theme.textSecondary}
                      />
                    ) : (
                      <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                searchQuery ? (
                  <Text style={[styles.noUsersText, { color: theme.textSecondary }]}>
                    No registered users match "{searchQuery}"
                  </Text>
                ) : (
                  <Text style={[styles.noUsersText, { color: theme.textMuted }]}>
                    Type a username to discover contacts
                  </Text>
                )
              }
            />

            {isGroupMode && (
              <TouchableOpacity
                onPress={handleCreateGroup}
                style={[styles.createGroupBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.createGroupBtnText}>
                  Create Lounge ({selectedUserIds.length} members)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 12,
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1
  },
  noticeText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 15
  },
  listContent: {
    paddingVertical: 8
  },
  convoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12
  },
  avatarWrapper: {
    position: 'relative'
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#090B10'
  },
  convoDetails: {
    flex: 1,
    gap: 4
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  convoTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1
  },
  timeText: {
    fontSize: 11
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  lastMsg: {
    fontSize: 13,
    flex: 1
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '700'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
    marginTop: 40
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700'
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18
  },
  startChatBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8
  },
  startChatBtnText: {
    color: '#090B10',
    fontWeight: '700',
    fontSize: 14
  },
  headerNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  headerNewBtnText: {
    color: '#090B10',
    fontWeight: '700',
    fontSize: 12
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 16
  },
  modalCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 14
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800'
  },
  modeTabs: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 3
  },
  modeTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '700'
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8
  },
  inputSearch: {
    flex: 1,
    fontSize: 14,
    padding: 0
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18
  },
  userDisplayName: {
    fontSize: 14,
    fontWeight: '700'
  },
  userUsername: {
    fontSize: 12
  },
  noUsersText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 13
  },
  createGroupBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6
  },
  createGroupBtnText: {
    color: '#090B10',
    fontWeight: '700',
    fontSize: 14
  }
});
