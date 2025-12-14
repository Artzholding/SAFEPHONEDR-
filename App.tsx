/**
 * SafePhone DR - Main Application Entry
 * 
 * A mobile security app designed to protect users in the Dominican Republic
 * from common phone scams including phishing, malicious apps, and unsafe networks.
 * 
 * PRIVACY FIRST: All data processing happens locally on the device.
 * No information is sent to external servers.
 * 
 * @version 1.0.0
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from './src/context/LanguageContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
