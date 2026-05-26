import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BADGE_COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

type EffectBadgeProps = {
  label: string;
  category: keyof typeof BADGE_COLORS;
};

// Small visual capsule component presenting module tags styled per categories
export const EffectBadge = ({ label, category }: EffectBadgeProps) => {
  const backgroundColor = BADGE_COLORS[category] || '#7A7A8A';

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#0E0E0F',
    fontSize: 10,
    fontFamily: FONTS.technicalLabel,
    textTransform: 'uppercase',
  },
});
