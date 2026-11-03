import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { api } from '../../src/services/api';
import Header from '../../src/components/Header';
import SearchBar from '../../src/components/SearchBar';
import CategoryChips from '../../src/components/CategoryChips';
import ResourceCard from '../../src/components/ResourceCard';
import AdBanner from '../../src/components/AdBanner';
import { WebsiteLink, Category, ResourceSection } from '../../src/types';

export default function ExploreScreen() {
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState<'all' | ResourceSection>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [links, setLinks] = useState<WebsiteLink[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const catRes = await api.getCategories(activeTab === 'all' ? undefined : activeTab);
      setCategories(catRes.categories || []);

      const linkParams: any = {};
      if (activeTab !== 'all') linkParams.section = activeTab;
      if (selectedCategoryId) linkParams.category_id = selectedCategoryId;
      if (searchQuery.trim()) linkParams.search = searchQuery.trim();

      const linkRes = await api.getLinks(linkParams);
      setLinks(linkRes.links || []);
    } catch (err) {
      console.warn('Failed to load explore links:', err);
    }
  }, [activeTab, selectedCategoryId, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleTabChange = (tab: 'all' | ResourceSection) => {
    setActiveTab(tab);
    setSelectedCategoryId(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header subtitle="Free Resources & Useful Directories" />

      {/* Main Section Navigation Pills */}
      <View style={[styles.tabBar, { backgroundColor: theme.secondaryBackground, borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity
          onPress={() => handleTabChange('all')}
          style={[styles.tabItem, activeTab === 'all' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
        >
          <Text style={[styles.tabItemText, { color: activeTab === 'all' ? theme.primary : theme.textSecondary }]}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleTabChange('entertainment')}
          style={[styles.tabItem, activeTab === 'entertainment' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
        >
          <Text style={[styles.tabItemText, { color: activeTab === 'entertainment' ? theme.primary : theme.textSecondary }]}>
            Entertainment
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleTabChange('movies')}
          style={[styles.tabItem, activeTab === 'movies' && { borderBottomColor: theme.secondary, borderBottomWidth: 2 }]}
        >
          <Text style={[styles.tabItemText, { color: activeTab === 'movies' ? theme.secondary : theme.textSecondary }]}>
            Movies
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleTabChange('tools')}
          style={[styles.tabItem, activeTab === 'tools' && { borderBottomColor: theme.cyan, borderBottomWidth: 2 }]}
        >
          <Text style={[styles.tabItemText, { color: activeTab === 'tools' ? theme.cyan : theme.textSecondary }]}>
            Tools
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={`Search ${activeTab === 'all' ? 'all resources' : activeTab}...`}
      />

      {/* Category Filter Chips */}
      {categories.length > 0 && (
        <CategoryChips
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
      )}

      <AdBanner />

      {/* Resources FlatList */}
      <FlatList
        data={links}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ResourceCard link={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Resources Found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Try adjusting your search keywords or switching category filters.
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
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    paddingHorizontal: 8
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center'
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: '700'
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 24
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
    marginTop: 60
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
