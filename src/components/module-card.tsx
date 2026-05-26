import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

type ModuleParameter = {
  label: string;
  value: number | string | null;
};

type ModuleCardProps = {
  title: string;
  type: string | null;
  isActive: boolean;
  parameters: ModuleParameter[];
};

// Represents a premium styled module box with dynamic amber/gray active status LEDs
export const ModuleCard = ({
  title,
  type,
  isActive,
  parameters,
}: ModuleCardProps) => {
  const ledColor = isActive ? COLORS.primary : COLORS.ledOff;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.ledIndicator, { backgroundColor: ledColor }]} />
          <Text style={styles.titleText}>{title}</Text>
        </View>
        <Text style={[styles.typeText, isActive && styles.activeTypeText]}>
          {type || 'OFF'}
        </Text>
      </View>

      {parameters.length > 0 && (
        <View style={styles.paramGrid}>
          {parameters.map((param, index) => {
            const displayValue =
              param.value !== null && param.value !== undefined
                ? param.value
                : '—';
            return (
              <View key={`${title}-param-${index}`} style={styles.paramItem}>
                <Text style={styles.paramLabel}>{param.label}</Text>
                <Text style={styles.paramValue}>{displayValue}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 6,
    padding: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ledIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  titleText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.technicalLabel,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  typeText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
  },
  activeTypeText: {
    color: COLORS.textPrimary,
  },
  paramGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: COLORS.background,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  paramItem: {
    flex: 1,
    minWidth: '25%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  paramLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.technicalLabel,
    fontSize: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  paramValue: {
    color: COLORS.primary,
    fontFamily: FONTS.technicalLabel,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
