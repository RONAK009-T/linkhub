import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';
import { Message, Conversation } from '../types';

interface ChatNotification {
  conversationId: number;
  senderName: string;
  content: string;
  created_at: string;
}

interface ChatContextType {
  conversations: Conversation[];
  activeConversationId: number | null;
  messages: Message[];
  isLoadingMessages: boolean;
  typingUsers: string[];
  notification: ChatNotification | null;
  dismissNotification: () => void;
  loadConversations: () => Promise<void>;
  openConversation: (id: number) => Promise<void>;
  closeConversation: () => void;
  sendMessage: (content: string) => Promise<void>;
  deleteMessage: (messageId: number) => Promise<void>;
  clearConversation: () => Promise<void>;
  startTyping: () => void;
  stopTyping: () => void;
}

const ChatContext = createContext<ChatContextType>({} as ChatContextType);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [notification, setNotification] = useState<ChatNotification | null>(null);

  const activeIdRef = useRef<number | null>(null);
  activeIdRef.current = activeConversationId;

  // 1-second Countdown Sweep: updates remaining seconds and purges expired messages client-side
  useEffect(() => {
    const timer = setInterval(() => {
      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const now = Date.now();
        return prev
          .map((m) => {
            const exp = new Date(m.expires_at).getTime();
            const left = Math.max(0, Math.ceil((exp - now) / 1000));
            return { ...m, remaining_seconds: left };
          })
          .filter((m) => m.remaining_seconds > 0);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Listen to Socket.IO events
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !token) return;

    const handleNewMessage = (msg: Message) => {
      if (activeIdRef.current === msg.conversation_id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          const isMine = msg.sender_id === user?.id;
          return [...prev, { ...msg, is_mine: isMine }];
        });
      }
      loadConversations();
    };

    const handleMessageDeleted = ({ messageId, conversationId }: { messageId: number; conversationId: number }) => {
      if (activeIdRef.current === conversationId) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      }
    };

    const handleConversationCleared = ({ conversationId }: { conversationId: number }) => {
      if (activeIdRef.current === conversationId) {
        setMessages([]);
      }
      loadConversations();
    };

    const handleMessagesExpired = () => {
      // Trigger sweep against current server timestamp
      setMessages((prev) => {
        const now = Date.now();
        return prev.filter((m) => new Date(m.expires_at).getTime() > now);
      });
    };

    const handleNotification = (notif: ChatNotification) => {
      if (activeIdRef.current !== notif.conversationId) {
        setNotification(notif);
      }
    };

    const handleUserTyping = ({ conversationId, username }: { conversationId: number; username: string }) => {
      if (activeIdRef.current === conversationId) {
        setTypingUsers((prev) => Array.from(new Set([...prev, username])));
      }
    };

    const handleUserStoppedTyping = ({ conversationId }: { conversationId: number }) => {
      if (activeIdRef.current === conversationId) {
        setTypingUsers([]);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('conversation_cleared', handleConversationCleared);
    socket.on('messages_expired', handleMessagesExpired);
    socket.on('chat_notification', handleNotification);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('conversation_cleared', handleConversationCleared);
      socket.off('messages_expired', handleMessagesExpired);
      socket.off('chat_notification', handleNotification);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
    };
  }, [token, user]);

  const loadConversations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.getConversations();
      setConversations(res.conversations || []);
    } catch (e) {
      console.warn('Failed to load conversations:', e);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadConversations();
    }
  }, [token, loadConversations]);

  const openConversation = async (id: number) => {
    setActiveConversationId(id);
    setIsLoadingMessages(true);
    const socket = getSocket();
    if (socket) {
      socket.emit('join_conversation', { conversationId: id });
    }

    try {
      const res = await api.getMessages(id);
      setMessages(res.messages || []);
    } catch (err) {
      console.warn('Failed to fetch messages for conversation:', id, err);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const closeConversation = () => {
    const socket = getSocket();
    if (socket && activeConversationId) {
      socket.emit('leave_conversation', { conversationId: activeConversationId });
    }
    setActiveConversationId(null);
    setMessages([]);
    setTypingUsers([]);
  };

  const sendMessage = async (content: string) => {
    if (!activeConversationId || !content.trim()) return;

    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('send_message', {
        conversationId: activeConversationId,
        content: content.trim()
      });
    } else {
      // Fallback via HTTP API if socket is temporarily connecting
      const res = await api.sendMessage(activeConversationId, content.trim());
      if (res.data) {
        setMessages((prev) => [...prev, res.data]);
      }
    }
  };

  const deleteMessage = async (messageId: number) => {
    const socket = getSocket();
    if (socket && socket.connected && activeConversationId) {
      socket.emit('delete_message', { messageId, conversationId: activeConversationId });
    } else {
      await api.deleteMessage(messageId);
    }
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  const clearConversation = async () => {
    if (!activeConversationId) return;
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('clear_conversation', { conversationId: activeConversationId });
    } else {
      await api.clearConversation(activeConversationId);
    }
    setMessages([]);
  };

  const startTyping = () => {
    const socket = getSocket();
    if (socket && activeConversationId) {
      socket.emit('typing_start', { conversationId: activeConversationId });
    }
  };

  const stopTyping = () => {
    const socket = getSocket();
    if (socket && activeConversationId) {
      socket.emit('typing_stop', { conversationId: activeConversationId });
    }
  };

  const dismissNotification = () => setNotification(null);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversationId,
        messages,
        isLoadingMessages,
        typingUsers,
        notification,
        dismissNotification,
        loadConversations,
        openConversation,
        closeConversation,
        sendMessage,
        deleteMessage,
        clearConversation,
        startTyping,
        stopTyping
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
