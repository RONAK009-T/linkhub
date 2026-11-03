import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Resolve appropriate API Base URL for Web, Android Emulator, and physical devices
const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    // 10.0.2.2 refers to host localhost on standard Android emulators
    return 'http://10.0.2.2:5000';
  }
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = async (): Promise<string | null> => {
  if (authToken) return authToken;
  try {
    const stored = await AsyncStorage.getItem('linkhub_token');
    authToken = stored;
    return stored;
  } catch {
    return null;
  }
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
    }

    return data as T;
  } catch (err: any) {
    console.warn(`[API Request Error ${endpoint}]`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  register: (payload: { username: string; email: string; password: string; display_name?: string }) =>
    request<{ token: string; user: any; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  login: (payload: { login: string; password: string }) =>
    request<{ token: string; user: any; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  googleAuth: (payload: { idToken?: string; accessToken?: string }) =>
    request<{ token: string; user: any; message: string }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getMe: () => request<{ user: any }>('/api/auth/me'),

  updateProfile: (payload: { display_name?: string; bio?: string; avatar_url?: string; status?: string }) =>
    request<{ user: any; message: string }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  forgotPassword: (email: string) =>
    request<{ message: string; debugResetToken?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  resetPassword: (payload: { token: string; newPassword: string }) =>
    request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  searchUsers: (query: string) =>
    request<{ users: any[] }>(`/api/auth/users/search?q=${encodeURIComponent(query)}`),

  deleteAccount: () =>
    request<{ message: string }>('/api/auth/account', { method: 'DELETE' }),

  // Chat
  getConversations: () => request<{ conversations: any[] }>('/api/chat/conversations'),

  createConversation: (payload: { recipientId?: number; participantIds?: number[]; title?: string; isGroup?: boolean }) =>
    request<{ conversationId?: number; conversation?: any; isExisting?: boolean }>('/api/chat/conversations', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getMessages: (conversationId: number) =>
    request<{ messages: any[]; server_time: string }>(`/api/chat/conversations/${conversationId}/messages`),

  sendMessage: (conversationId: number, content: string) =>
    request<{ data: any; message: string }>(`/api/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  deleteMessage: (messageId: number) =>
    request<{ message: string }>(`/api/chat/messages/${messageId}`, { method: 'DELETE' }),

  clearConversation: (conversationId: number) =>
    request<{ message: string }>(`/api/chat/conversations/${conversationId}/messages`, { method: 'DELETE' }),

  // Links & Categories
  getLinks: (params?: { section?: string; category_id?: number; featured?: boolean; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.section) query.append('section', params.section);
    if (params?.category_id) query.append('category_id', String(params.category_id));
    if (params?.featured) query.append('featured', '1');
    if (params?.search) query.append('search', params.search);
    return request<{ links: any[] }>(`/api/links?${query.toString()}`);
  },

  getCategories: (section?: string) =>
    request<{ categories: any[] }>(`/api/links/categories${section ? `?section=${section}` : ''}`),

  getLinkById: (id: number) =>
    request<{ link: any }>(`/api/links/${id}`),

  toggleFavorite: (linkId: number) =>
    request<{ message: string; is_favorite: boolean; link_id: number }>(`/api/links/${linkId}/favorite`, {
      method: 'POST'
    }),

  getUserFavorites: () =>
    request<{ favorites: any[] }>('/api/links/user/favorites'),

  reportResource: (payload: { reportedUserId?: number; reportedLinkId?: number; reason: string; details?: string }) =>
    request<{ message: string }>('/api/links/report', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Admin
  getAdminStats: () => request<any>('/api/admin/stats'),
  getAllUsers: (search?: string, role?: string) => {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (role) query.append('role', role);
    return request<{ users: any[] }>(`/api/admin/users?${query.toString()}`);
  },
  updateUser: (id: number, payload: { role?: string; is_banned?: boolean }) =>
    request<{ user: any; message: string }>(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  createLink: (link: any) =>
    request<{ message: string; linkId: number }>('/api/admin/links', {
      method: 'POST',
      body: JSON.stringify(link)
    }),
  updateLink: (id: number, link: any) =>
    request<{ message: string }>(`/api/admin/links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(link)
    }),
  deleteLink: (id: number) =>
    request<{ message: string }>(`/api/admin/links/${id}`, { method: 'DELETE' }),
  createCategory: (cat: any) =>
    request<{ message: string; categoryId: number }>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(cat)
    }),
  getReports: () => request<{ reports: any[] }>('/api/admin/reports'),
  updateReportStatus: (id: number, status: string) =>
    request<{ message: string }>(`/api/admin/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
};
