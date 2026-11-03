export type UserRole = 'user' | 'admin';
export type UserStatus = 'online' | 'offline' | 'away';

export interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  role: UserRole;
  status: UserStatus;
  is_banned?: boolean;
  isGoogleLinked?: boolean;
  created_at?: string;
}

export interface ConversationMember {
  id: number;
  username: string;
  display_name: string;
  avatar_url?: string;
  status: UserStatus;
}

export interface Conversation {
  id: number;
  is_group: boolean;
  title: string;
  avatar_url?: string;
  members: ConversationMember[];
  other_user?: ConversationMember;
  last_message?: string;
  last_message_time?: string;
  active_messages: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name: string;
  sender_username: string;
  sender_avatar?: string;
  content: string;
  created_at: string;
  expires_at: string;
  remaining_seconds: number;
  is_mine?: boolean;
}

export type ResourceSection = 'entertainment' | 'movies' | 'gaming' | 'tools';

export interface Category {
  id: number;
  slug: string;
  name: string;
  icon: string;
  description?: string;
  section: ResourceSection | 'general';
}

export interface WebsiteLink {
  id: number;
  title: string;
  url: string;
  description: string;
  logo_url?: string;
  category_id?: number;
  category_name?: string;
  section: ResourceSection;
  is_featured: boolean;
  badge?: string;
  click_count: number;
  is_favorite?: boolean;
  created_at?: string;
}

export interface AdminStats {
  metrics: {
    total_users: number;
    online_users: number;
    total_links: number;
    active_conversations: number;
    active_temporary_messages: number;
    pending_reports: number;
  };
  sections_distribution: { section: string; count: number }[];
  system_status: {
    uptime_seconds: number;
    database: string;
    node_version: string;
  };
}

export interface ModerationReport {
  id: number;
  reporter_id: number;
  reporter_username: string;
  reported_user_id?: number;
  reported_username?: string;
  reported_link_id?: number;
  reported_link_title?: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  created_at: string;
}
