import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { googleServices } from '../services/googleServices';

interface GoogleSearchModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function GoogleSearchModal({ visible, onClose }: GoogleSearchModalProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    onClose();
    await googleServices.searchWeb(searchQuery);
    setSearchQuery('');
  };

  const handleOpenMaps = async () => {
    onClose();
    await googleServices.openMapsLocation('Gaming cafes and tech centers near me');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="logo-google" size={20} color={theme.primary} />
              <Text style={[styles.title, { color: theme.text }]}>Google Web Search</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Search the web securely for gaming wikis, tools, and streaming media.
          </Text>

          {/* Search Input */}
          <View style={[styles.inputRow, { backgroundColor: theme.secondaryBackground, borderColor: theme.cardBorder }]}>
            <Ionicons name="search" size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search Google..."
              placeholderTextColor={theme.textMuted}
              autoFocus
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={handleOpenMaps}
              style={[styles.mapsBtn, { backgroundColor: theme.secondaryBackground, borderColor: theme.cardBorder }]}
            >
              <Ionicons name="map-outline" size={16} color={theme.cyan} />
              <Text style={[styles.mapsBtnText, { color: theme.cyan }]}>Nearby Hubs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSearch}
              style={[styles.searchBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.searchBtnText}>Search</Text>
              <Ionicons name="arrow-forward" size={15} color="#090B10" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  container: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 14
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  title: {
    fontSize: 17,
    fontWeight: '700'
  },
  closeBtn: {
    padding: 4
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 4
  },
  mapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1
  },
  mapsBtnText: {
    fontSize: 13,
    fontWeight: '600'
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10
  },
  searchBtnText: {
    color: '#090B10',
    fontSize: 14,
    fontWeight: '700'
  }
});
