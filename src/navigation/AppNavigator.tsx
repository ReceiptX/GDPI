import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { User } from '../types';
import { telemetry } from '../services/telemetry';
import { colors, fonts } from '../utils/theme';

// Import screens (will be created)
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import AIQuoteAnalysisScreen from '../screens/AIQuoteAnalysisScreen';
import ManualQuoteEntryScreen from '../screens/ManualQuoteEntryScreen';
import NeighborhoodPricingScreen from '../screens/NeighborhoodPricingScreen';
import AdminRosterScreen from '../screens/AdminRosterScreen';
import HOARegistrationScreen from '../screens/HOARegistrationScreen';
import ValueTimelineScreen from '../screens/ValueTimelineScreen';

export type RootStackParamList = {
  Login: undefined;
  HOARegistration: undefined;
  Home: undefined;
  AIQuoteAnalysis: undefined;
  ManualQuoteEntry: undefined;
  NeighborhoodPricing: undefined;
  AdminRoster: undefined;
  ValueTimeline: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface AppNavigatorProps {
  user: User | null;
  onLogin?: (user: User) => void;
  onLogout?: () => void;
}

export default function AppNavigator({ user, onLogin, onLogout }: AppNavigatorProps) {
  const [showRegistration, setShowRegistration] = React.useState(false);

  const linking = {
    prefixes: [],
    config: {
      screens: {
        Login: 'login',
        HOARegistration: 'register',
        Home: 'home',
        AIQuoteAnalysis: 'ai-analysis',
        NeighborhoodPricing: 'pricing-history',
        AdminRoster: 'admin',
      },
    },
  };

  return (
    <NavigationContainer
      linking={linking}
      onStateChange={(state) => {
        if (state) {
          const currentRoute = state.routes[state.index];
          telemetry.traceNavigation(currentRoute.name, currentRoute.params);
        }
      }}
    >
      <Stack.Navigator
        initialRouteName={user ? 'Home' : 'Login'}
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontFamily: fonts.headingStrong,
            color: colors.text,
          },
          contentStyle: {
            backgroundColor: colors.bg,
          },
          headerShadowVisible: false,
        }}
      >
        {!user ? (
          <>
            {!showRegistration ? (
              <Stack.Screen
                name="Login"
                options={{ title: 'GDPI Login', headerShown: false }}
              >
                {(props) => (
                  <LoginScreen 
                    {...props} 
                    onLogin={onLogin || (() => {})} 
                    onRegister={() => setShowRegistration(true)}
                  />
                )}
              </Stack.Screen>
            ) : (
              <Stack.Screen
                name="HOARegistration"
                options={{ title: 'Register HOA', headerShown: false }}
              >
                {(props) => (
                  <HOARegistrationScreen 
                    {...props} 
                    onRegistrationComplete={() => setShowRegistration(false)}
                  />
                )}
              </Stack.Screen>
            )}
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              options={{ title: 'GDPI Home' }}
            >
              {(props) => <HomeScreen {...props} user={user} onLogout={onLogout || (() => {})} />}
            </Stack.Screen>
            <Stack.Screen
              name="AIQuoteAnalysis"
              options={{ title: 'AI Quote Analysis' }}
            >
              {(props) => <AIQuoteAnalysisScreen {...props} user={user} />}
            </Stack.Screen>

            <Stack.Screen
              name="ManualQuoteEntry"
              options={{ title: 'Manual Quote Entry' }}
            >
              {(props) => <ManualQuoteEntryScreen {...props} user={user} />}
            </Stack.Screen>

            <Stack.Screen
              name="ValueTimeline"
              component={ValueTimelineScreen}
              options={{ title: 'Why $1.99 matters' }}
            />
            <Stack.Screen
              name="NeighborhoodPricing"
              options={{ title: 'Neighborhood Pricing' }}
            >
              {(props) => <NeighborhoodPricingScreen {...props} user={user} />}
            </Stack.Screen>
            {user.role === 'admin' && (
              <Stack.Screen
                name="AdminRoster"
                options={{ title: 'Manage Residents' }}
              >
                {(props) => <AdminRosterScreen {...props} user={user} />}
              </Stack.Screen>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
