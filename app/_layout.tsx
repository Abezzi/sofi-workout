import '@/global.css';
import { NAV_THEME } from '@/lib/theme';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Text } from '@/components/ui/text';
import { Suspense, useEffect } from 'react';
// drizzle config and related libraries
import { DATABASE_NAME, db, expoDb } from '@/db';
import { SQLiteProvider } from 'expo-sqlite';
import { ActivityIndicator, View } from 'react-native';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import {
  checkDatabaseState,
  initializeDatabase,
  loadExerciseTypes,
  resetDatabase,
} from '@/db/logic';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/drizzle/migrations';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Constants from 'expo-constants';

// public key for clerk production
const publishableKey =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!publishableKey) {
  throw new Error('Missing Clerk publishableKey. Check your app.json');
}

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// resetDatabase();
function DatabaseInitializer() {
  const { success, error } = useMigrations(db, migrations);

  if (__DEV__) useDrizzleStudio(expoDb);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('first lunch, initializing app data...');
        await initializeDatabase();
        await loadExerciseTypes();
        await checkDatabaseState();
        console.log('✅ app initialized successfully');
      } catch (error) {
        console.log('❌ failed to initialize app: ', error);
      }
    };

    const handleMigrations = async () => {
      if (success) {
        console.log('✅ Migrations applied successfully');
        await initializeApp();
      } else if (error) {
        console.error('❌ Migration error details:', error);
        return (
          <View>
            <Text>migration error: {JSON.stringify(error, null, 2)}</Text>
          </View>
        );
      }
    };
    handleMigrations();
  }, [success, error]);

  return null;
}

export default function RootLayout() {
  return <AppWithDrizzle />;
}

function ThemedApp() {
  const { colorScheme } = useColorScheme();
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <GestureHandlerRootView>
        <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
          <DatabaseInitializer />
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Routes />
          <PortalHost />
        </ThemeProvider>
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}

function AppWithDrizzle() {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        options={{ enableChangeListener: true }}
        useSuspense>
        <ThemedApp />
      </SQLiteProvider>
    </Suspense>
  );
}

SplashScreen.preventAutoHideAsync();

function Routes() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
      // redirect based on authentication
      if (isSignedIn) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(auth)/sign-in');
      }
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return null;
  }

  return (
    <Stack>
      {/* Screens only shown when the user is NOT signed in */}
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)/sign-in" options={SIGN_IN_SCREEN_OPTIONS} />
        <Stack.Screen name="(auth)/sign-up" options={SIGN_UP_SCREEN_OPTIONS} />
        <Stack.Screen name="(auth)/reset-password" options={DEFAULT_AUTH_SCREEN_OPTIONS} />
        <Stack.Screen name="(auth)/forgot-password" options={DEFAULT_AUTH_SCREEN_OPTIONS} />
      </Stack.Protected>

      {/* Screens only shown when the user IS signed in */}
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>

      {/* Screens outside the guards are accessible to everyone (e.g. not found) */}
    </Stack>
  );
}

const SIGN_IN_SCREEN_OPTIONS = {
  headerShown: false,
  title: 'Sign in',
};

const SIGN_UP_SCREEN_OPTIONS = {
  presentation: 'modal',
  title: '',
  headerTransparent: true,
  gestureEnabled: false,
} as const;

const DEFAULT_AUTH_SCREEN_OPTIONS = {
  title: '',
  headerShadowVisible: false,
  headerTransparent: true,
};
