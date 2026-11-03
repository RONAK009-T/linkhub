import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Category } from '../types';

interface CategoryChipsProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
}

export default function CategoryChips({ categories, selectedCategoryId, onSelectCategory }: CategoryChipsProps) {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <TouchableOpacity
        onPress={() => onSelectCategory(null)}
        style={[
          styles.chip,
          {
            backgroundColor: selectedCategoryId === null ? theme.primary : theme.card,
            borderColor: selectedCategoryId === null ? theme.primary : theme.cardBorder
          }
        ]}
      >
        <Text
          style={[
            styles.chipText,
            { color: selectedCategoryId === null ? '#090B10' : theme.textSecondary }
          ]}
        >
          All
        </Text>
      </TouchableOpacity>

      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onSelectCategory(cat.id)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? theme.primary : theme.card,
                borderColor: isSelected ? theme.primary : theme.cardBorder
              }
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: isSelected ? '#090B10' : theme.textSecondary }
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    flexDirection: 'row'
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600'
  }
});
