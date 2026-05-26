import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ActionSheetIOS,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { type Patch } from '../types/patch';
import { EffectBadge } from './effect-badge';

type PatchCardProps = {
  patch: Patch;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

// Represents a card displaying song and patch properties with actions sheet triggers
export const PatchCard = ({
  patch,
  onPress,
  onEdit,
  onDelete,
}: PatchCardProps) => {
  const [showDropdown, setShowDropdown] = useState(false);

  // Formulates active effect badges list
  const activeBadges: { label: string; category: 'COMP' | 'DRIVE' | 'ZNR' | 'MODULATION' | 'DELAY' | 'REVERB' }[] = [];

  if (patch.compType && patch.compType !== 'OFF') {
    activeBadges.push({ label: 'COMP', category: 'COMP' });
  }
  if (patch.driveType && patch.driveType !== 'OFF') {
    activeBadges.push({ label: 'DRIVE', category: 'DRIVE' });
  }
  if (patch.znrType && patch.znrType !== 'OFF') {
    activeBadges.push({ label: 'ZNR', category: 'ZNR' });
  }
  if (patch.modType && patch.modType !== 'OFF') {
    activeBadges.push({ label: 'MOD', category: 'MODULATION' });
  }
  if (patch.delayType && patch.delayType !== 'OFF') {
    activeBadges.push({ label: 'DELAY', category: 'DELAY' });
  }
  if (patch.reverbType && patch.reverbType !== 'OFF') {
    activeBadges.push({ label: 'REVERB', category: 'REVERB' });
  }

  const handleMenuPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Ver Detalhes', 'Editar', 'Excluir', 'Cancelar'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 3,
          title: patch.songName,
          message: patch.artist,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) onPress();
          else if (buttonIndex === 1) onEdit();
          else if (buttonIndex === 2) onDelete();
        }
      );
    } else {
      Alert.alert(
        `${patch.songName}`,
        `Artista: ${patch.artist}`,
        [
          { text: 'Ver Detalhes', onPress: onPress },
          { text: 'Editar', onPress: onEdit },
          {
            text: 'Excluir',
            onPress: onDelete,
            style: 'destructive',
          },
          { text: 'Cancelar', style: 'cancel' },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.textContainer}>
          <Text style={styles.songName} numberOfLines={1}>
            {patch.songName}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {patch.artist}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={handleMenuPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons
            name="dots-vertical"
            size={24}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.badgesRow}>
          {activeBadges.length > 0 ? (
            activeBadges.map((badge, idx) => (
              <EffectBadge
                key={`${patch.id}-badge-${idx}`}
                label={badge.label}
                category={badge.category}
              />
            ))
          ) : (
            <Text style={styles.cleanLabel}>CLEAN BYPASS</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  songName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: FONTS.bodyBold,
    marginBottom: 4,
  },
  artistName: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
  },
  menuButton: {
    padding: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  cleanLabel: {
    color: COLORS.secondary,
    fontFamily: FONTS.technicalLabel,
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
