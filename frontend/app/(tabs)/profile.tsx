import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { googleServices } from '../../src/services/googleServices';
import { api } from '../../src/services/api';
import Header from '../../src/components/Header';
import ResourceCard from '../../src/components/ResourceCard';
import { WebsiteLink } from '../../src/types';

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout, deleteAccount } = useAuth();
  const router = useRouter();

  const [favorites, setFavorites] = useState<WebsiteLink[]>([]);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [activeTab, setActiveTab] = useState<'favorites' | 'settings'>('favorites');

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
    googleServices.getAnalyticsConsent().then(setAnalyticsConsent);
  }, [user]);

  const loadFavorites = async () => {
    try {
      const res = await api.getUserFavorites();
      setFavorites(res.favorites || []);
    } catch (e) {
      console.warn('Failed to load favorites:', e);
    }
  };

  const handleToggleConsent = async (val: boolean) => {
    setAnalyticsConsent(val);
    await googleServices.setAnalyticsConsent(val);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(tabs)');
  };

  const handleDeleteAccount = () => {
    const performDelete = async () => {
      try {
        await deleteAccount();
        router.replace('/(tabs)');
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to delete account.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you absolutely sure you want to permanently delete your account and all data?')) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Account',
        'Are you sure you want to permanently delete your LinkHub account and all associated data?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete Permanently', style: 'destructive', onPress: performDelete }
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header subtitle="Account, Favorites & Settings" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card or Guest Card */}
        {user ? (
          <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.profileTop}>
              <Image
                source={{
                  uri: user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
                }}
                style={styles.avatar}
              />
              <View style={styles.profileInfo}>
                <View style={styles.nameRow}>
                  <Text style={[styles.displayName, { color: theme.text }]}>{user.display_name}</Text>
                  {user.role === 'admin' && (
                    <View style={[styles.adminBadge, { backgroundColor: theme.secondaryMuted, borderColor: theme.secondary }]}>
                      <Text style={[styles.adminBadgeText, { color: theme.secondary }]}>ADMIN</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.username, { color: theme.textSecondary }]}>@{user.username}</Text>
                <Text style={[styles.email, { color: theme.textMuted }]}>{user.email}</Text>

                {/* Google Linked Indicator */}
                <View style={styles.googleStatusRow}>
                  <Ionicons name="logo-google" size={13} color={user.isGoogleLinked ? theme.primary : theme.textMuted} />
                  <Text style={[styles.googleStatusText, { color: user.isGoogleLinked ? theme.primary : theme.textMuted }]}>
                    {user.isGoogleLinked ? 'Google Account Connected' : 'Standard Password Login'}
                  </Text>
                </View>
              </View>
            </View>

            {user.bio ? (
              <Text style={[styles.bioText, { color: theme.textSecondary }]}>{user.bio}</Text>
            ) : null}

            {/* Admin Dashboard shortcut button if admin */}
            {user.role === 'admin' && (
              <TouchableOpacity
                onPress={() => router.push('/admin')}
                style={[styles.adminAccessBtn, { backgroundColor: theme.secondaryMuted, borderColor: theme.secondary }]}
              >
                <Ionicons name="shield-outline" size={18} color={theme.secondary} />
                <Text style={[styles.adminAccessBtnText, { color: theme.secondary }]}>
                  Open Admin Moderation Panel
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.secondary} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={[styles.guestCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Ionicons name="person-circle-outline" size={56} color={theme.primary} />
            <Text style={[styles.guestTitle, { color: theme.text }]}>Join the LinkHub Community</Text>
            <Text style={[styles.guestSubtitle, { color: theme.textSecondary }]}>
              Log in to start 60-second temporary chats, save favorites, and participate in lounges.
            </Text>

            <View style={styles.authButtonsRow}>
              <TouchableOpacity
                onPress={() => router.push('/auth/login')}
                style={[styles.loginBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.loginBtnText}>Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/auth/register')}
                style={[styles.registerBtn, { backgroundColor: theme.secondaryBackground, borderColor: theme.cardBorder }]}
              >
                <Text style={[styles.registerBtnText, { color: theme.text }]}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tab switch between Bookmarked Favorites & App Settings */}
        {user && (
          <View style={[styles.subTabs, { backgroundColor: theme.secondaryBackground }]}>
            <TouchableOpacity
              onPress={() => setActiveTab('favorites')}
              style={[styles.subTab, activeTab === 'favorites' && { backgroundColor: theme.card }]}
            >
              <Ionicons
                name="bookmark"
                size={15}
                color={activeTab === 'favorites' ? theme.primary : theme.textSecondary}
              />
              <Text style={[styles.subTabText, { color: activeTab === 'favorites' ? theme.primary : theme.textSecondary }]}>
                Saved Favorites ({favorites.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('settings')}
              style={[styles.subTab, activeTab === 'settings' && { backgroundColor: theme.card }]}
            >
              <Ionicons
                name="settings-outline"
                size={15}
                color={activeTab === 'settings' ? theme.primary : theme.textSecondary}
              />
              <Text style={[styles.subTabText, { color: activeTab === 'settings' ? theme.primary : theme.textSecondary }]}>
                App Settings
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tab 1: Favorites */}
        {(!user || activeTab === 'favorites') && (
          <View style={{ marginTop: 8 }}>
            {favorites.length > 0 ? (
              favorites.map((link) => (
                <ResourceCard
                  key={`fav-${link.id}`}
                  link={link}
                  onFavoriteChange={() => loadFavorites()}
                />
              ))
            ) : user ? (
              <View style={styles.emptyFavorites}>
                <Ionicons name="bookmark-outline" size={42} color={theme.textMuted} />
                <Text style={[styles.emptyFavTitle, { color: theme.text }]}>No Bookmarks Saved Yet</Text>
                <Text style={[styles.emptyFavSubtitle, { color: theme.textSecondary }]}>
                  Browse entertainment, movies, and tools in the Explore tab to bookmark your favorite resources.
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Tab 2: Settings */}
        {user && activeTab === 'settings' && (
          <View style={[styles.settingsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.settingsSectionTitle, { color: theme.text }]}>Preferences & Privacy</Text>

            {/* Dark Theme Setting */}
            <View style={[styles.settingRow, { borderBottomColor: theme.cardBorder }]}>
              <View style={styles.settingLabelRow}>
                <Ionicons name="moon-outline" size={18} color={theme.primary} />
                <Text style={[styles.settingText, { color: theme.text }]}>Dark Mode</Text>
              </View>
              <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: theme.primary, false: '#334155' }} />
            </View>

            {/* Google Analytics Opt-in */}
            <View style={[styles.settingRow, { borderBottomColor: theme.cardBorder }]}>
              <View style={styles.settingLabelRow}>
                <Ionicons name="analytics-outline" size={18} color={theme.cyan} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingText, { color: theme.text }]}>Google Analytics Consent</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Anonymous feature usage telemetry
                  </Text>
                </View>
              </View>
              <Switch
                value={analyticsConsent}
                onValueChange={handleToggleConsent}
                trackColor={{ true: theme.cyan, false: '#334155' }}
              />
            </View>

            {/* Temporary Chat Policy Notice */}
            <View style={[styles.settingRow, { borderBottomColor: theme.cardBorder }]}>
              <View style={styles.settingLabelRow}>
                <Ionicons name="shield-checkmark" size={18} color={theme.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingText, { color: theme.text }]}>Server-Side Auto Disappear</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Strict 60-second message expiration hard enforced
                  </Text>
                </View>
              </View>
              <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
            </View>

            {/* Actions: Logout & Delete Account */}
            <View style={styles.dangerZone}>
              <TouchableOpacity
                onPress={handleLogout}
                style={[styles.logoutBtn, { borderColor: theme.cardBorder, backgroundColor: theme.secondaryBackground }]}
              >
                <Ionicons name="log-out-outline" size={18} color={theme.warning} />
                <Text style={[styles.logoutBtnText, { color: theme.warning }]}>Log Out of LinkHub</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeleteAccount}
                style={[styles.deleteBtn, { borderColor: theme.danger, backgroundColor: theme.dangerMuted }]}
              >
                <Ionicons name="trash-outline" size={18} color={theme.danger} />
                <Text style={[styles.deleteBtnText, { color: theme.danger }]}>Delete Account & Data</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 30
  },
  profileCard: {
    margin: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32
  },
  profileInfo: {
    flex: 1,
    gap: 2
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  displayName: {
    fontSize: 17,
    fontWeight: '800'
  },
  adminBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1
  },
  adminBadgeText: {
    fontSize: 9,
    fontWeight: '800'
  },
  username: {
    fontSize: 13
  },
  email: {
    fontSize: 12
  },
  googleStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4
  },
  googleStatusText: {
    fontSize: 11,
    fontWeight: '600'
  },
  bioText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4
  },
  adminAccessBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 6
  },
  adminAccessBtnText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginLeft: 8
  },
  guestCard: {
    margin: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    textAlign: 'center'
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '800'
  },
  guestSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18
  },
  authButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    width: '100%'
  },
  loginBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  loginBtnText: {
    color: '#090B10',
    fontWeight: '700',
    fontSize: 14
  },
  registerBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center'
  },
  registerBtnText: {
    fontWeight: '700',
    fontSize: 14
  },
  subTabs: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 10,
    padding: 3
  },
  subTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8
  },
  subTabText: {
    fontSize: 12.5,
    fontWeight: '700'
  },
  emptyFavorites: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 10,
    marginTop: 20
  },
  emptyFavTitle: {
    fontSize: 16,
    fontWeight: '700'
  },
  emptyFavSubtitle: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18
  },
  settingsCard: {
    margin: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14
  },
  settingsSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  settingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 12
  },
  settingText: {
    fontSize: 14,
    fontWeight: '600'
  },
  settingSub: {
    fontSize: 11,
    marginTop: 2
  },
  dangerZone: {
    marginTop: 10,
    gap: 10
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700'
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: '700'
  }
});
