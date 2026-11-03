import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
  ActivityIndicator,
  Alert,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { api } from '../../src/services/api';
import { AdminStats, ModerationReport, User, WebsiteLink, ResourceSection } from '../../src/types';

export default function AdminDashboardScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'stats' | 'links' | 'users' | 'reports'>('stats');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [links, setLinks] = useState<WebsiteLink[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Link Modal state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<number | null>(null);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDesc, setLinkDesc] = useState('');
  const [linkLogo, setLinkLogo] = useState('');
  const [linkSection, setLinkSection] = useState<ResourceSection>('entertainment');
  const [linkBadge, setLinkBadge] = useState('');
  const [linkFeatured, setLinkFeatured] = useState(false);

  // User search
  const [userSearch, setUserSearch] = useState('');

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [statsRes, linksRes, usersRes, reportsRes] = await Promise.all([
        api.getAdminStats(),
        api.getLinks(),
        api.getAllUsers(),
        api.getReports()
      ]);
      setStats(statsRes);
      setLinks(linksRes.links || []);
      setUsers(usersRes.users || []);
      setReports(reportsRes.reports || []);
    } catch (e: any) {
      console.warn('Admin load error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== 'admin') {
      alert('Access restricted to administrators.');
      router.back();
      return;
    }
    loadData();
  }, [user, loadData]);

  const handleSaveLink = async () => {
    if (!linkTitle.trim() || !linkUrl.trim() || !linkDesc.trim()) {
      alert('Title, URL, and Description are required.');
      return;
    }

    try {
      const payload = {
        title: linkTitle.trim(),
        url: linkUrl.trim(),
        description: linkDesc.trim(),
        logo_url: linkLogo.trim() || undefined,
        section: linkSection,
        badge: linkBadge.trim() || undefined,
        is_featured: linkFeatured
      };

      if (editingLinkId) {
        await api.updateLink(editingLinkId, payload);
      } else {
        await api.createLink(payload);
      }

      setShowLinkModal(false);
      resetLinkForm();
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save website link.');
    }
  };

  const resetLinkForm = () => {
    setEditingLinkId(null);
    setLinkTitle('');
    setLinkUrl('');
    setLinkDesc('');
    setLinkLogo('');
    setLinkSection('entertainment');
    setLinkBadge('');
    setLinkFeatured(false);
  };

  const handleOpenEditLink = (l: WebsiteLink) => {
    setEditingLinkId(l.id);
    setLinkTitle(l.title);
    setLinkUrl(l.url);
    setLinkDesc(l.description);
    setLinkLogo(l.logo_url || '');
    setLinkSection(l.section);
    setLinkBadge(l.badge || '');
    setLinkFeatured(l.is_featured);
    setShowLinkModal(true);
  };

  const handleDeleteLink = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resource link?')) return;
    try {
      await api.deleteLink(id);
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Failed to delete link.');
    }
  };

  const handleToggleUserBan = async (targetUser: User) => {
    try {
      const nextBan = !targetUser.is_banned;
      await api.updateUser(targetUser.id, { is_banned: nextBan });
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Failed to update ban status.');
    }
  };

  const handleToggleAdminRole = async (targetUser: User) => {
    try {
      const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
      await api.updateUser(targetUser.id, { role: nextRole });
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Failed to update user role.');
    }
  };

  const handleUpdateReport = async (reportId: number, status: string) => {
    try {
      await api.updateReportStatus(reportId, status);
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Failed to update report.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: theme.secondaryBackground, borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Admin Moderation Hub</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
            Metrics, Resources, Users & Moderation
          </Text>
        </View>
        <TouchableOpacity onPress={loadData} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.navTabs, { backgroundColor: theme.secondaryBackground, borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('stats')}
          style={[styles.navTab, activeTab === 'stats' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
        >
          <Ionicons name="stats-chart" size={14} color={activeTab === 'stats' ? theme.primary : theme.textSecondary} />
          <Text style={[styles.navTabText, { color: activeTab === 'stats' ? theme.primary : theme.textSecondary }]}>
            Stats
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('links')}
          style={[styles.navTab, activeTab === 'links' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
        >
          <Ionicons name="link" size={14} color={activeTab === 'links' ? theme.primary : theme.textSecondary} />
          <Text style={[styles.navTabText, { color: activeTab === 'links' ? theme.primary : theme.textSecondary }]}>
            Links ({links.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('users')}
          style={[styles.navTab, activeTab === 'users' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
        >
          <Ionicons name="people" size={14} color={activeTab === 'users' ? theme.primary : theme.textSecondary} />
          <Text style={[styles.navTabText, { color: activeTab === 'users' ? theme.primary : theme.textSecondary }]}>
            Users ({users.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('reports')}
          style={[styles.navTab, activeTab === 'reports' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
        >
          <Ionicons name="alert-circle" size={14} color={activeTab === 'reports' ? theme.primary : theme.textSecondary} />
          <Text style={[styles.navTabText, { color: activeTab === 'reports' ? theme.primary : theme.textSecondary }]}>
            Reports ({reports.length})
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingBar}>
          <ActivityIndicator size="small" color={theme.primary} />
        </View>
      )}

      {/* Tab Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Tab 1: Stats & Overview */}
        {activeTab === 'stats' && stats && (
          <View style={styles.tabContent}>
            <View style={styles.metricsGrid}>
              <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Ionicons name="people-outline" size={24} color={theme.primary} />
                <Text style={[styles.metricVal, { color: theme.text }]}>{stats.metrics.total_users}</Text>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Total Registered Users</Text>
              </View>

              <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Ionicons name="pulse" size={24} color={theme.cyan} />
                <Text style={[styles.metricVal, { color: theme.text }]}>{stats.metrics.online_users}</Text>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Online Now</Text>
              </View>

              <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Ionicons name="link-outline" size={24} color={theme.secondary} />
                <Text style={[styles.metricVal, { color: theme.text }]}>{stats.metrics.total_links}</Text>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Curated Resources</Text>
              </View>

              <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Ionicons name="chatbubbles-outline" size={24} color={theme.warning} />
                <Text style={[styles.metricVal, { color: theme.text }]}>{stats.metrics.active_conversations}</Text>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Active Chat Rooms</Text>
              </View>

              <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Ionicons name="timer-outline" size={24} color={theme.primary} />
                <Text style={[styles.metricVal, { color: theme.text }]}>{stats.metrics.active_temporary_messages}</Text>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Live Temporary Messages</Text>
              </View>

              <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Ionicons name="alert-circle-outline" size={24} color={theme.danger} />
                <Text style={[styles.metricVal, { color: theme.text }]}>{stats.metrics.pending_reports}</Text>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Pending Reports</Text>
              </View>
            </View>

            {/* System Info Box */}
            <View style={[styles.systemBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.systemTitle, { color: theme.text }]}>System Diagnostics</Text>
              <Text style={[styles.systemRow, { color: theme.textSecondary }]}>
                Database Store: <Text style={{ color: theme.primary, fontWeight: '700' }}>{stats.system_status.database}</Text>
              </Text>
              <Text style={[styles.systemRow, { color: theme.textSecondary }]}>
                Node Engine: <Text style={{ color: theme.text }}>{stats.system_status.node_version}</Text>
              </Text>
              <Text style={[styles.systemRow, { color: theme.textSecondary }]}>
                Server Uptime: <Text style={{ color: theme.text }}>{Math.floor(stats.system_status.uptime_seconds)}s</Text>
              </Text>
              <Text style={[styles.systemRow, { color: theme.textSecondary }]}>
                60s Message Auto-Purge: <Text style={{ color: theme.primary, fontWeight: '700' }}>ACTIVE (2000ms loop)</Text>
              </Text>
            </View>
          </View>
        )}

        {/* Tab 2: Manage Links */}
        {activeTab === 'links' && (
          <View style={styles.tabContent}>
            <TouchableOpacity
              onPress={() => {
                resetLinkForm();
                setShowLinkModal(true);
              }}
              style={[styles.addLinkBtn, { backgroundColor: theme.primary }]}
            >
              <Ionicons name="add-circle" size={18} color="#090B10" />
              <Text style={styles.addLinkBtnText}>Add Curated Resource Link</Text>
            </TouchableOpacity>

            {links.map((l) => (
              <View
                key={`admin-link-${l.id}`}
                style={[styles.adminItemCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.itemTitle, { color: theme.text }]}>{l.title}</Text>
                    {l.is_featured && (
                      <View style={[styles.featBadge, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}>
                        <Text style={[styles.featBadgeText, { color: theme.primary }]}>FEATURED</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.itemUrl, { color: theme.textSecondary }]}>{l.url}</Text>
                  <Text style={[styles.itemDesc, { color: theme.textMuted }]} numberOfLines={2}>
                    {l.description}
                  </Text>
                </View>

                <View style={styles.itemActions}>
                  <TouchableOpacity onPress={() => handleOpenEditLink(l)} style={styles.actionBtn}>
                    <Ionicons name="create-outline" size={18} color={theme.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteLink(l.id)} style={styles.actionBtn}>
                    <Ionicons name="trash-outline" size={18} color={theme.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tab 3: Manage Users */}
        {activeTab === 'users' && (
          <View style={styles.tabContent}>
            <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Ionicons name="search" size={16} color={theme.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                value={userSearch}
                onChangeText={setUserSearch}
                placeholder="Filter registered users by name or email..."
                placeholderTextColor={theme.textMuted}
              />
            </View>

            {users
              .filter(
                (u) =>
                  !userSearch ||
                  u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                  u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                  u.display_name.toLowerCase().includes(userSearch.toLowerCase())
              )
              .map((u) => (
                <View
                  key={`user-${u.id}`}
                  style={[styles.adminItemCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.itemTitle, { color: theme.text }]}>{u.display_name}</Text>
                      <View style={[styles.featBadge, { backgroundColor: u.role === 'admin' ? theme.secondaryMuted : theme.primaryMuted, borderColor: u.role === 'admin' ? theme.secondary : theme.primary }]}>
                        <Text style={[styles.featBadgeText, { color: u.role === 'admin' ? theme.secondary : theme.primary }]}>
                          {u.role.toUpperCase()}
                        </Text>
                      </View>
                      {Boolean(u.is_banned) && (
                        <View style={[styles.featBadge, { backgroundColor: theme.dangerMuted, borderColor: theme.danger }]}>
                          <Text style={[styles.featBadgeText, { color: theme.danger }]}>BANNED</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.itemUrl, { color: theme.textSecondary }]}>@{u.username} • {u.email}</Text>
                  </View>

                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      onPress={() => handleToggleAdminRole(u)}
                      style={[styles.roleBtn, { borderColor: theme.cardBorder }]}
                    >
                      <Text style={[styles.roleBtnText, { color: theme.secondary }]}>
                        {u.role === 'admin' ? 'Demote' : 'Promote'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleToggleUserBan(u)}
                      style={[styles.banBtn, { backgroundColor: u.is_banned ? theme.primaryMuted : theme.dangerMuted }]}
                    >
                      <Text style={[styles.banBtnText, { color: u.is_banned ? theme.primary : theme.danger }]}>
                        {u.is_banned ? 'Unban' : 'Ban'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
          </View>
        )}

        {/* Tab 4: Content Reports */}
        {activeTab === 'reports' && (
          <View style={styles.tabContent}>
            {reports.length === 0 ? (
              <View style={styles.emptyReports}>
                <Ionicons name="shield-checkmark-outline" size={48} color={theme.primary} />
                <Text style={[styles.itemTitle, { color: theme.text }]}>All Clear</Text>
                <Text style={[styles.itemDesc, { color: theme.textSecondary }]}>
                  No pending user or content moderation reports found.
                </Text>
              </View>
            ) : (
              reports.map((r) => (
                <View
                  key={`report-${r.id}`}
                  style={[styles.adminItemCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                >
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={[styles.itemTitle, { color: theme.danger }]}>Reason: {r.reason}</Text>
                    <Text style={[styles.itemUrl, { color: theme.textSecondary }]}>
                      Reported by @{r.reporter_username} • Status: {r.status}
                    </Text>
                    {r.details ? (
                      <Text style={[styles.itemDesc, { color: theme.text }]}>{r.details}</Text>
                    ) : null}
                  </View>

                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      onPress={() => handleUpdateReport(r.id, 'dismissed')}
                      style={[styles.roleBtn, { borderColor: theme.cardBorder }]}
                    >
                      <Text style={[styles.roleBtnText, { color: theme.textSecondary }]}>Dismiss</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleUpdateReport(r.id, 'action_taken')}
                      style={[styles.banBtn, { backgroundColor: theme.primaryMuted }]}
                    >
                      <Text style={[styles.banBtnText, { color: theme.primary }]}>Resolve</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add / Edit Link Modal */}
      <Modal visible={showLinkModal} transparent animationType="slide" onRequestClose={() => setShowLinkModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editingLinkId ? 'Edit Website Resource' : 'Add Website Resource'}
              </Text>
              <TouchableOpacity onPress={() => setShowLinkModal(false)}>
                <Ionicons name="close" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: 12 }}>
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Title *</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: theme.secondaryBackground, borderColor: theme.cardBorder, color: theme.text }]}
                  value={linkTitle}
                  onChangeText={setLinkTitle}
                  placeholder="e.g. 1900–2050 (FMHY)"
                  placeholderTextColor={theme.textMuted}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>URL *</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: theme.secondaryBackground, borderColor: theme.cardBorder, color: theme.text }]}
                  value={linkUrl}
                  onChangeText={setLinkUrl}
                  placeholder="https://fmhy.net/"
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Description *</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: theme.secondaryBackground, borderColor: theme.cardBorder, color: theme.text, height: 60 }]}
                  value={linkDesc}
                  onChangeText={setLinkDesc}
                  placeholder="Comprehensive directory of free internet media..."
                  placeholderTextColor={theme.textMuted}
                  multiline
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Logo URL</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: theme.secondaryBackground, borderColor: theme.cardBorder, color: theme.text }]}
                  value={linkLogo}
                  onChangeText={setLinkLogo}
                  placeholder="https://... logo.png"
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Badge</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: theme.secondaryBackground, borderColor: theme.cardBorder, color: theme.text }]}
                  value={linkBadge}
                  onChangeText={setLinkBadge}
                  placeholder="e.g. Featured Hub, Free, Top Utility"
                  placeholderTextColor={theme.textMuted}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={[styles.fieldLabel, { color: theme.text }]}>Featured on Homepage</Text>
                <Switch value={linkFeatured} onValueChange={setLinkFeatured} trackColor={{ true: theme.primary, false: '#334155' }} />
              </View>

              <TouchableOpacity
                onPress={handleSaveLink}
                style={[styles.modalSubmitBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.modalSubmitBtnText}>
                  {editingLinkId ? 'Save Changes' : 'Create Resource Link'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12
  },
  backBtn: {
    padding: 4
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800'
  },
  headerSub: {
    fontSize: 11
  },
  refreshBtn: {
    padding: 6
  },
  navTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1
  },
  navTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 12
  },
  navTabText: {
    fontSize: 12,
    fontWeight: '700'
  },
  loadingBar: {
    paddingVertical: 6,
    alignItems: 'center'
  },
  scrollContent: {
    padding: 12
  },
  tabContent: {
    gap: 12
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  metricCard: {
    width: '48%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 6
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '800'
  },
  metricLabel: {
    fontSize: 11
  },
  systemBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    marginTop: 6
  },
  systemTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2
  },
  systemRow: {
    fontSize: 12
  },
  addLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10
  },
  addLinkBtnText: {
    color: '#090B10',
    fontSize: 13,
    fontWeight: '800'
  },
  adminItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  itemUrl: {
    fontSize: 11,
    marginTop: 1
  },
  itemDesc: {
    fontSize: 11.5,
    marginTop: 2
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  actionBtn: {
    padding: 6
  },
  featBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5
  },
  featBadgeText: {
    fontSize: 8.5,
    fontWeight: '800'
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0
  },
  roleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1
  },
  roleBtnText: {
    fontSize: 11,
    fontWeight: '700'
  },
  banBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  banBtnText: {
    fontSize: 11,
    fontWeight: '700'
  },
  emptyReports: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 8
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
    maxHeight: '85%',
    gap: 12
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800'
  },
  fieldGroup: {
    gap: 4
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700'
  },
  modalInput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  modalSubmitBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8
  },
  modalSubmitBtnText: {
    color: '#090B10',
    fontSize: 13,
    fontWeight: '800'
  }
});
