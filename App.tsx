import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { User } from './src/types';
import { StorageService } from './src/services/storage';
import { colors, fonts } from './src/utils/theme';

import { useFonts as useInterFonts, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useFonts as useSoraFonts, Sora_700Bold, Sora_800ExtraBold } from '@expo-google-fonts/sora';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [interLoaded] = useInterFonts({
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [soraLoaded] = useSoraFonts({
    Sora_700Bold,
    Sora_800ExtraBold,
  });

  const textDefaultsSet = useRef(false);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (!interLoaded || !soraLoaded) return;
    if (textDefaultsSet.current) return;

    // Set default typography app-wide (body font). Headings override this with `fonts.heading*`.
    // React Native typing doesn't always expose `defaultProps` on Text.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    Text.defaultProps = Text.defaultProps || {};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const existing = Text.defaultProps.style;
    const baseStyle = { fontFamily: fonts.body, color: colors.text };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    Text.defaultProps.style = Array.isArray(existing)
      ? [baseStyle, ...existing]
      : [baseStyle, existing].filter(Boolean);

    textDefaultsSet.current = true;
  }, [interLoaded, soraLoaded]);

  const initializeApp = async () => {
    try {
      // Initialize demo data if needed
      await StorageService.initializeDemoData();
      
      // Check if user is already logged in
      const currentUser = await StorageService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const fontsReady = interLoaded && soraLoaded;

  if (loading || !fontsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator user={user} onLogin={handleLogin} onLogout={handleLogout} />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
});
