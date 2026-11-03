import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import GoogleSearchModal from './GoogleSearchModal';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export default function Header({ title, subtitle, showBack, onBack, rightAction }: HeaderProps) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showSearchModal, setShowSearchModal] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.secondaryBackground, borderBottomColor: theme.cardBorder }]}>
      <View style={styles.leftRow}>
        {showBack && onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.brandContainer}>
            <View style={[styles.logoIcon, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}>
              <Ionicons name="flash" size={18} color={theme.primary} />
            </View>
            <View>
              <Text style={[styles.brandText, { color: theme.text }]}>
                Link<Text style={{ color: theme.primary }}>Hub</Text>
              </Text>
              {subtitle && <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
            </View>
          </View>
        )}
      </View>

      <View style={styles.rightRow}>
        {rightAction ? (
          rightAction
        ) : (
          <>
            {/* Quick Google Search */}
            <TouchableOpacity
              onPress={() => setShowSearchModal(true)}
              style={[styles.iconButton, { backgroundColor: theme.card }]}
              accessibilityLabel="Google Search"
            >
              <Ionicons name="logo-google" size={16} color={theme.primary} />
            </TouchableOpacity>

            {/* Dark / Light Theme Toggle */}
            <TouchableOpacity
              onPress={toggleTheme}
              style={[styles.iconButton, { backgroundColor: theme.card }]}
              accessibilityLabel="Toggle Theme"
            >
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={17} color={theme.warning} />
            </TouchableOpacity>

            {/* Online Indicator */}
            {user && (
              <View style={[styles.statusDot, { backgroundColor: theme.primary }]} />
            )}
          </>
        )}
      </View>

      <GoogleSearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    paddingTop: Platform.OS === 'ios' ? 48 : 12
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500'
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginLeft: 2
  }
});
