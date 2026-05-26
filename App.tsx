import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import {
  DMSans_400Regular,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { SpaceMono_400Regular } from '@expo-google-fonts/space-mono';

import { COLORS } from './src/constants/colors';
import { initDatabase } from './src/database/db-init';
import { ToastProvider } from './src/context/toast-context';
import { AppNavigator } from './src/navigation/app-navigator';

// Main root component configuring fonts loading and initial database bootstrap
export const App = () => {
  const [dbInitialized, setDbInitialized] = useState(false);

  // Load standard premium Google Fonts
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_700Bold,
    SpaceMono_400Regular,
  });

  // Bootstrap SQLite schema and pre-seed mock entries
  useEffect(() => {
    const bootstrapDb = async () => {
      try {
        await initDatabase();
        setDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database during boot:', error);
      }
    };

    bootstrapDb();
  }, []);

  // Show a professional, dark theme activity loader until boot completion
  if (!fontsLoaded || !dbInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ToastProvider>
      <NavigationContainer>
        <AppNavigator />
        <StatusBar style="light" />
      </NavigationContainer>
    </ToastProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
