import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { api } from '../../src/services/api';
import Header from '../../src/components/Header';
import SearchBar from '../../src/components/SearchBar';
import ResourceCard from '../../src/components/ResourceCard';
import AdBanner from '../../src/components/AdBanner';
import { WebsiteLink } from '../../src/types';

const GAME_CATEGORIES = [
  { id: 'all', name: 'All Games', icon: 'grid-outline' },
  { id: 'online', name: 'Online Games', icon: 'globe-outline' },
  { id: 'pc', name: 'PC Games', icon: 'laptop-outline' },
  { id: 'casual', name: 'Casual Games', icon: 'sparkles-outline' },
  { id: 'multiplayer', name: 'Multiplayer', icon: 'people-outline' },
  { id: 'trending', name: 'Trending', icon: 'flame-outline' }
];

export default function GamesScreen() {
  const { theme } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [gameLinks, setGameLinks] = useState<WebsiteLink[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await api.getLinks({ section: 'gaming', search: searchQuery });
      setGameLinks(res.links || []);
    } catch (e) {
      console.warn('Failed to load games:', e);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredGames = gameLinks.filter((link) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'online') return link.category_id === 3 || link.title.toLowerCase().includes('online') || link.title.toLowerCase().includes('poki');
    if (selectedCategory === 'pc') return link.category_id === 4 || link.title.toLowerCase().includes('pc') || link.title.toLowerCase().includes('koyso');
    if (selectedCategory === 'casual') return link.category_id === 5;
    if (selectedCategory === 'multiplayer') return link.category_id === 6;
    if (selectedCategory === 'trending') return link.is_featured;
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header subtitle="Play Online & PC Gaming Hubs" />

      <FlatList
        data={filteredGames}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ResourceCard link={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        ListHeaderComponent={
          <>
            {/* Poki & Koyso Highlight Banner */}
            <View style={styles.featuredGrid}>
              {/* Poki Instant Play Card */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => WebBrowser.openBrowserAsync('https://poki.com/')}
                style={[styles.featuredBox, { backgroundColor: '#1A2338', borderColor: theme.primary }]}
              >
                <View style={styles.featuredTop}>
                  <View style={[styles.logoCircle, { backgroundColor: '#090B10' }]}>
                    <Ionicons name="game-controller" size={24} color={theme.primary} />
                  </View>
                  <View style={[styles.tagPill, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}>
                    <Text style={[styles.tagPillText, { color: theme.primary }]}>INSTANT PLAY</Text>
                  </View>
                </View>
                <Text style={[styles.featuredTitle, { color: theme.text }]}>Poki Games</Text>
                <Text style={[styles.featuredDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                  Play free browser games instantly with zero downloads.
                </Text>
              </TouchableOpacity>

              {/* Koyso PC Game Card */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => WebBrowser.openBrowserAsync('https://koyso.net/')}
                style={[styles.featuredBox, { backgroundColor: '#211B38', borderColor: theme.secondary }]}
              >
                <View style={styles.featuredTop}>
                  <View style={[styles.logoCircle, { backgroundColor: '#090B10' }]}>
                    <Ionicons name="desktop-outline" size={24} color={theme.secondary} />
                  </View>
                  <View style={[styles.tagPill, { backgroundColor: theme.secondaryMuted, borderColor: theme.secondary }]}>
                    <Text style={[styles.tagPillText, { color: theme.secondary }]}>PC GAMING</Text>
                  </View>
                </View>
                <Text style={[styles.featuredTitle, { color: theme.text }]}>PC Game (Koyso)</Text>
                <Text style={[styles.featuredDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                  Discover PC games, hardware recommendations, and setup guides.
                </Text>
              </TouchableOpacity>
            </View>

            <AdBanner />

            {/* Search Input */}
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search Poki, Koyso, indie games & emulators..."
            />

            {/* Category Filter Pills */}
            <View style={styles.categoryScroll}>
              {GAME_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected ? theme.primary : theme.card,
                        borderColor: isSelected ? theme.primary : theme.cardBorder
                      }
                    ]}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={14}
                      color={isSelected ? '#090B10' : theme.textSecondary}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        { color: isSelected ? '#090B10' : theme.textSecondary }
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="game-controller-outline" size={48} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Games Found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Try choosing another category or clearing your search term.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  listContent: {
    paddingBottom: 30
  },
  featuredGrid: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 10
  },
  featuredBox: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 8
  },
  featuredTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tagPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1
  },
  tagPillText: {
    fontSize: 8.5,
    fontWeight: '800'
  },
  featuredTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  featuredDesc: {
    fontSize: 11,
    lineHeight: 15
  },
  categoryScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
    marginTop: 40
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700'
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18
  }
});
