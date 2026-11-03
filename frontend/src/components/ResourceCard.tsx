import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { WebsiteLink } from '../types';

interface ResourceCardProps {
  link: WebsiteLink;
  onFavoriteChange?: (linkId: number, isFav: boolean) => void;
  onEdit?: (link: WebsiteLink) => void;
  onDelete?: (linkId: number) => void;
  isAdmin?: boolean;
}

export default function ResourceCard({ link, onFavoriteChange, onEdit, onDelete, isAdmin }: ResourceCardProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState<boolean>(Boolean(link.is_favorite));
  const [clicks, setClicks] = useState<number>(link.click_count || 0);
  const [isTogglingFav, setIsTogglingFav] = useState(false);

  const handleOpenLink = async () => {
    try {
      setClicks(prev => prev + 1);
      // Inform backend of click asynchronously
      api.getLinkById(link.id).catch(() => {});
      await WebBrowser.openBrowserAsync(link.url);
    } catch (e) {
      console.warn('Failed to open link:', e);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('Please log in to save favorites.');
      return;
    }
    if (isTogglingFav) return;

    try {
      setIsTogglingFav(true);
      const nextFav = !isFavorite;
      setIsFavorite(nextFav);
      const res = await api.toggleFavorite(link.id);
      setIsFavorite(res.is_favorite);
      if (onFavoriteChange) {
        onFavoriteChange(link.id, res.is_favorite);
      }
    } catch (err: any) {
      setIsFavorite(!isFavorite); // revert
      alert(err.message || 'Failed to update favorite');
    } finally {
      setIsTogglingFav(false);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      {/* Top Banner & Badges */}
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          {link.is_featured && (
            <View style={[styles.badge, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}>
              <Ionicons name="sparkles" size={11} color={theme.primary} />
              <Text style={[styles.badgeText, { color: theme.primary }]}>FEATURED</Text>
            </View>
          )}

          {link.badge && (
            <View style={[styles.badge, { backgroundColor: theme.secondaryMuted, borderColor: theme.secondary }]}>
              <Text style={[styles.badgeText, { color: theme.secondary }]}>{link.badge.toUpperCase()}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={handleToggleFavorite}
          style={[styles.favButton, { backgroundColor: theme.secondaryBackground }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Bookmark resource"
        >
          <Ionicons
            name={isFavorite ? 'bookmark' : 'bookmark-outline'}
            size={16}
            color={isFavorite ? theme.primary : theme.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Main Content Info */}
      <TouchableOpacity activeOpacity={0.8} onPress={handleOpenLink} style={styles.contentRow}>
        <View style={[styles.logoContainer, { backgroundColor: theme.secondaryBackground, borderColor: theme.cardBorder }]}>
          {link.logo_url ? (
            <Image source={{ uri: link.logo_url }} style={styles.logoImage} resizeMode="contain" />
          ) : (
            <Ionicons name="globe-outline" size={26} color={theme.primary} />
          )}
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {link.title}
          </Text>
          <Text style={[styles.urlText, { color: theme.textSecondary }]} numberOfLines={1}>
            {link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </Text>
        </View>
      </TouchableOpacity>

      <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
        {link.description}
      </Text>

      {/* Footer Info: Category, Clicks, Open Action */}
      <View style={[styles.footer, { borderTopColor: theme.cardBorder }]}>
        <View style={styles.statsRow}>
          <View style={styles.metaChip}>
            <Ionicons name="folder-outline" size={12} color={theme.textMuted} />
            <Text style={[styles.metaText, { color: theme.textMuted }]}>
              {link.category_name || link.section}
            </Text>
          </View>

          <View style={styles.metaChip}>
            <Ionicons name="eye-outline" size={12} color={theme.textMuted} />
            <Text style={[styles.metaText, { color: theme.textMuted }]}>
              {clicks}
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          {isAdmin && (
            <>
              {onEdit && (
                <TouchableOpacity onPress={() => onEdit(link)} style={styles.iconAction}>
                  <Ionicons name="create-outline" size={16} color={theme.secondary} />
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity onPress={() => onDelete(link.id)} style={styles.iconAction}>
                  <Ionicons name="trash-outline" size={16} color={theme.danger} />
                </TouchableOpacity>
              )}
            </>
          )}

          <TouchableOpacity
            onPress={handleOpenLink}
            style={[styles.launchButton, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.launchButtonText}>Launch</Text>
            <Ionicons name="open-outline" size={13} color="#090B10" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginVertical: 6,
    marginHorizontal: 12,
    gap: 10
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap'
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  favButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  logoContainer: {
    width: 46,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 4
  },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: 6
  },
  textContainer: {
    flex: 1
  },
  title: {
    fontSize: 16,
    fontWeight: '700'
  },
  urlText: {
    fontSize: 11,
    marginTop: 2
  },
  description: {
    fontSize: 13,
    lineHeight: 18
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    marginTop: 2
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  metaText: {
    fontSize: 11
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  iconAction: {
    padding: 6
  },
  launchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  launchButtonText: {
    color: '#090B10',
    fontSize: 12,
    fontWeight: '700'
  }
});
