/**
 * SafePhone DR - Root Navigation
 * Main navigation structure with bottom tabs and stack screens
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { RootStackParamList, MainTabParamList } from '../types';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { WifiSafetyScreen } from '../screens/WifiSafetyScreen';
import { SecureBrowserScreen } from '../screens/SecureBrowserScreen';
import { PhishingWarningScreen } from '../screens/PhishingWarningScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab bar icon component
interface TabIconProps {
  focused: boolean;
  icon: string;
  label: string;
}

const TabIcon: React.FC<TabIconProps> = ({ focused, icon, label }) => (
  <View style={styles.tabIconContainer}>
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icon}</Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
  </View>
);

// Main Tab Navigator
const MainTabNavigator: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="🏠" label={t('home')} />
          ),
        }}
      />
      <Tab.Screen
        name="WifiSafety"
        component={WifiSafetyScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="📶" label={t('wifiSafety')} />
          ),
        }}
      />
      <Tab.Screen
        name="Browser"
        component={SecureBrowserScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="🌐" label={t('browser')} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="⚙️" label={t('settings')} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Root Stack Navigator
export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen 
        name="SecureBrowser" 
        component={SecureBrowserScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="PhishingWarning" 
        component={PhishingWarningScreen}
        options={{
          animation: 'fade',
          presentation: 'fullScreenModal',
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    height: 80,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  tabIconFocused: {
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray,
    fontWeight: '500',
  },
  tabLabelFocused: {
    color: COLORS.accent,
    fontWeight: '700',
  },
});
