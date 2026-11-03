import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Official Google AdMob Sample Test Banner ID (Safe for all testing!)
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
const LIVE_BANNER_ID = process.env.EXPO_PUBLIC_ADMOB_BANNER_ID || TEST_BANNER_ID;

export default function AdBanner() {
  const { theme } = useTheme();
  const [closed, setClosed] = useState(false);
  const [adComponent, setAdComponent] = useState<any>(null);

  useEffect(() => {
    // Only attempt to load Google Mobile Ads SDK on native mobile devices
    if (Platform.OS === 'android') {
      try {
        const GoogleAds = require('react-native-google-mobile-ads');
        if (GoogleAds && GoogleAds.BannerAd) {
          setAdComponent(() => GoogleAds.BannerAd);
        }
      } catch (e) {
        // Fall back to clean banner placeholder if native package not yet bundled
      }
    }
  }, []);

  if (closed) return null;

  // Native Google AdMob Banner for Android
  if (Platform.OS === 'android' && adComponent) {
    const BannerAd = adComponent;
    const { BannerAdSize } = require('react-native-google-mobile-ads');
    return (
      <View style={styles.nativeContainer}>
        <BannerAd
          unitId={__DEV__ ? TEST_BANNER_ID : LIVE_BANNER_ID}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        />
      </View>
    );
  }

  // Web & Testing Simulation Banner (Clean & Gaming Themed)
  return (
    <View style={[styles.container, { backgroundColor: theme.secondaryBackground, borderColor: theme.cardBorder }]}>
      <View style={styles.content}>
        <View style={[styles.adBadge, { backgroundColor: `${theme.secondary}22`, borderColor: theme.secondary }]}>
          <Text style={[styles.adBadgeText, { color: theme.secondary }]}>SPONSORED</Text>
        </View>
        <Text style={[styles.adText, { color: theme.textSecondary }]} numberOfLines={1}>
          LinkHub Lounge: Discover curated legal resources, PC setups & browser games
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => setClosed(true)}
        style={styles.closeBtn}
        accessibilityLabel="Dismiss ad banner"
      >
        <Ionicons name="close" size={14} color={theme.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1
  },
  nativeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  adBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5
  },
  adBadgeText: {
    fontSize: 8.5,
    fontWeight: '800'
  },
  adText: {
    fontSize: 11,
    flex: 1
  },
  closeBtn: {
    padding: 4
  }
});
