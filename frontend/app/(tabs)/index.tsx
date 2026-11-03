import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { api } from '../../src/services/api';
import Header from '../../src/components/Header';
import SearchBar from '../../src/components/SearchBar';
import ResourceCard from '../../src/components/ResourceCard';
import AdBanner from '../../src/components/AdBanner';
import { WebsiteLink } from '../../src/types';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [featuredLinks, setFeaturedLinks] = useState<WebsiteLink[]>([]);
  const [trendingGames, setTrendingGames] = useState<WebsiteLink[]>([]);
  const [recommendedTools, setRecommendedTools] = useState<WebsiteLink[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      // 1. Featured links (including FMHY, Poki, Koyso, Toolhunt)
      const resFeatured = await api.getLinks({ featured: true });
      setFeaturedLinks(resFeatured.links || []);

      // 2. Trending games
      const resGames = await api.getLinks({ section: 'gaming' });
      setTrendingGames((resGames.links || []).slice(0, 4));

      // 3. Recommended tools
      const resTools = await api.getLinks({ section: 'tools' });
      setRecommendedTools((resTools.links || []).slice(0, 4));
    } catch (err) {
      console.warn('Failed to load home links:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredFeatured = featuredLinks.filter((l) =>
    searchQuery
      ? l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header subtitle="Social Chat, Gaming & Entertainment" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        {/* Welcome Hero Banner */}
        <View style={[styles.heroCard, { backgroundColor: theme.secondaryBackground, borderColor: theme.cardBorder }]}>
          <View style={styles.heroTextRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.welcomeGreeting, { color: theme.primary }]}>
                {user ? `WELCOME BACK, ${user.display_name.toUpperCase()}!` : 'WELCOME TO LINKHUB'}
              </Text>
              <Text style={[styles.heroHeading, { color: theme.text }]}>
                Connect, Play & Discover Free Resources
              </Text>
              <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
                Temporary 60-second social chats, curated gaming hubs, free legal media, and top productivity tools.
              </Text>
            </View>
            <View style={[styles.heroIconBox, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}>
              <Ionicons name="game-controller" size={32} color={theme.primary} />
            </View>
          </View>

          {/* Quick Access to Temporary Chat Action */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/chat')}
            style={[styles.quickChatBanner, { backgroundColor: '#1A2F3D', borderColor: theme.primary }]}
          >
            <View style={styles.chatBannerLeft}>
              <View style={[styles.chatPulse, { backgroundColor: theme.primary }]} />
              <View>
                <Text style={[styles.chatBannerTitle, { color: theme.primary }]}>
                  Temporary Social Chat
                </Text>
                <Text style={[styles.chatBannerSubtitle, { color: theme.textSecondary }]}>
                  Messages self-destruct in 60 seconds with server cleanup
                </Text>
              </View>
            </View>
            <View style={[styles.chatEnterBtn, { backgroundColor: theme.primary }]}>
              <Ionicons name="arrow-forward" size={16} color="#090B10" />
            </View>
          </TouchableOpacity>
        </View>

        {/* AdMob Banner Simulation */}
        <AdBanner />

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search FMHY, Poki, Koyso, Toolhunt & more..."
        />

        {/* Section 1: Featured Websites */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="star" size={18} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Featured Websites</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
            <Text style={[styles.viewAllText, { color: theme.primary }]}>Explore All</Text>
          </TouchableOpacity>
        </View>

        {filteredFeatured.map((link) => (
          <ResourceCard key={link.id} link={link} />
        ))}

        {/* Section 2: Trending Games */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="game-controller" size={18} color={theme.secondary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Trending Games & Hubs</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/games')}>
            <Text style={[styles.viewAllText, { color: theme.secondary }]}>View Games</Text>
          </TouchableOpacity>
        </View>

        {trendingGames.map((link) => (
          <ResourceCard key={`game-${link.id}`} link={link} />
        ))}

        {/* Section 3: Recommended Tools */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="build" size={18} color={theme.cyan} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recommended Online Tools</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
            <Text style={[styles.viewAllText, { color: theme.cyan }]}>All Tools</Text>
          </TouchableOpacity>
        </View>

        {recommendedTools.map((link) => (
          <ResourceCard key={`tool-${link.id}`} link={link} />
        ))}

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
  heroCard: {
    margin: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 16
  },
  heroTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  welcomeGreeting: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4
  },
  heroHeading: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24
  },
  heroSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4
  },
  heroIconBox: {
    width: 58,
    height: 58,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  quickChatBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1
  },
  chatBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  chatPulse: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  chatBannerTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  chatBannerSubtitle: {
    fontSize: 11,
    marginTop: 1
  },
  chatEnterBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginTop: 16,
    marginBottom: 4
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700'
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600'
  }
});
