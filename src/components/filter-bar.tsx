import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

type SortOption = 'song_name' | 'artist' | 'created_at';

type FilterBarProps = {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  selectedSort: SortOption;
  onSortSelect: (sort: SortOption) => void;
  resultsCount: number;
};

// Provides search input field and horizontal tags sorting controls
export const FilterBar = ({
  searchQuery,
  onSearchChange,
  selectedSort,
  onSortSelect,
  resultsCount,
}: FilterBarProps) => {
  const sortChips: { label: string; value: SortOption }[] = [
    { label: 'Nome A→Z', value: 'song_name' },
    { label: 'Artista A→Z', value: 'artist' },
    { label: 'Mais Recentes', value: 'created_at' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={COLORS.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por música ou artista..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={onSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange('')}
            style={styles.clearButton}
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={18}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sortSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {sortChips.map((chip) => {
            const isSelected = selectedSort === chip.value;
            return (
              <TouchableOpacity
                key={chip.value}
                style={[
                  styles.chip,
                  isSelected
                    ? styles.chipSelected
                    : styles.chipUnselected,
                ]}
                onPress={() => onSortSelect(chip.value)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected
                      ? styles.chipTextSelected
                      : styles.chipTextUnselected,
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <Text style={styles.counterText}>
        {resultsCount === 1
          ? '1 patch encontrado'
          : `${resultsCount} patches encontrados`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    height: '100%',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  sortSection: {
    marginBottom: 10,
  },
  scrollContainer: {
    paddingRight: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipUnselected: {
    backgroundColor: 'transparent',
    borderColor: COLORS.border,
  },
  chipText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
  },
  chipTextSelected: {
    color: '#0E0E0F',
  },
  chipTextUnselected: {
    color: COLORS.textSecondary,
  },
  counterText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.technicalLabel,
    fontSize: 12,
    marginTop: 4,
    paddingLeft: 4,
  },
});
