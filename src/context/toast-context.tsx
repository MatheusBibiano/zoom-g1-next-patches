import React, { createContext, useState, useCallback, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

type ToastType = 'success' | 'danger';

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

const { width } = Dimensions.get('window');

type ToastProviderProps = {
  children: React.ReactNode;
};

// Provides state control and animations for standardized alert notifications across screens
export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('success');
  const [visible, setVisible] = useState(false);

  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  }, [translateY, opacity]);

  const showToast = useCallback(
    (msg: string, toastType: ToastType = 'success') => {
      // Clear previous timeout if exists
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setMessage(msg);
      setType(toastType);
      setVisible(true);

      // Trigger slide up and fade in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      timeoutRef.current = setTimeout(() => {
        hideToast();
      }, 2500);
    },
    [translateY, opacity, hideToast]
  );

  const iconName = type === 'success' ? 'check-circle' : 'alert-circle';
  const accentColor = type === 'success' ? COLORS.primary : COLORS.danger;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && (
        <View style={styles.toastContainer} pointerEvents="none">
          <Animated.View
            style={[
              styles.toastCard,
              {
                transform: [{ translateY }],
                opacity,
                borderLeftColor: accentColor,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={iconName}
              size={22}
              color={accentColor}
              style={styles.icon}
            />
            <Text style={styles.toastText} numberOfLines={2}>
              {message}
            </Text>
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 35,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    width: width - 48,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  icon: {
    marginRight: 12,
  },
  toastText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    lineHeight: 18,
  },
});
