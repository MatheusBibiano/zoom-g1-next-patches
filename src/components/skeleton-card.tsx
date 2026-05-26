import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { COLORS } from '../constants/colors';

// Renders an animated pulse card component to show loading indicators
export const SkeletonCard = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.songBar} />
          <View style={styles.artistBar} />
        </View>
        <View style={styles.menuCircle} />
      </View>
      <View style={styles.footer}>
        <View style={styles.badgesRow}>
          <View style={styles.badge} />
          <View style={styles.badge} />
          <View style={styles.badge} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  songBar: {
    height: 16,
    width: '60%',
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: 6,
  },
  artistBar: {
    height: 12,
    width: '40%',
    backgroundColor: COLORS.border,
    borderRadius: 4,
  },
  menuCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.border,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
  },
  badge: {
    height: 18,
    width: 45,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginRight: 6,
  },
});
