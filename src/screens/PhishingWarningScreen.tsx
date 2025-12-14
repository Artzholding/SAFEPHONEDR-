/**
 * SafePhone DR - Phishing Warning Screen
 * Full-screen warning when a suspicious URL is detected
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { RootStackParamList } from '../types';
import { PrimaryButton } from '../components/PrimaryButton';

type PhishingWarningNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PhishingWarning'>;
type PhishingWarningRouteProp = RouteProp<RootStackParamList, 'PhishingWarning'>;

export const PhishingWarningScreen: React.FC = () => {
  const { t } = useLanguage();
  const navigation = useNavigation<PhishingWarningNavigationProp>();
  const route = useRoute<PhishingWarningRouteProp>();
  
  const { url, reason } = route.params;

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Warning Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.warningIcon}>🚨</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{t('warningTitle')}</Text>
        <Text style={styles.subtitle}>{t('phishingDetected')}</Text>

        {/* Suspicious URL */}
        <View style={styles.urlBox}>
          <Text style={styles.urlLabel}>URL Detectada:</Text>
          <Text style={styles.urlText}>{url}</Text>
        </View>

        {/* Reason */}
        <View style={styles.reasonBox}>
          <Text style={styles.reasonLabel}>{t('phishingReason')}:</Text>
          <Text style={styles.reasonText}>{reason}</Text>
        </View>

        {/* Warning Messages */}
        <View style={styles.warningsContainer}>
          <View style={styles.warningItem}>
            <Text style={styles.warningEmoji}>⛔</Text>
            <Text style={styles.warningText}>
              Este sitio podría robar tu información bancaria
            </Text>
          </View>
          
          <View style={styles.warningItem}>
            <Text style={styles.warningEmoji}>🔐</Text>
            <Text style={styles.warningText}>
              {t('doNotEnterData')}
            </Text>
          </View>
          
          <View style={styles.warningItem}>
            <Text style={styles.warningEmoji}>📱</Text>
            <Text style={styles.warningText}>
              Usa solo la app oficial de tu banco o escribe la dirección manualmente
            </Text>
          </View>
          
          <View style={styles.warningItem}>
            <Text style={styles.warningEmoji}>📞</Text>
            <Text style={styles.warningText}>
              Si recibiste este enlace por WhatsApp, NO lo uses y reporta al contacto
            </Text>
          </View>
        </View>

        {/* Dominican Republic specific tip */}
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>🇩🇴 Tip para RD:</Text>
          <Text style={styles.tipText}>
            Los bancos dominicanos NUNCA te pedirán tu clave por WhatsApp, SMS o correo. 
            Si recibes un mensaje así, es una ESTAFA.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <PrimaryButton
            title={t('goBack')}
            onPress={handleGoBack}
            size="large"
            style={styles.safeButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.danger,
  },
  scrollContent: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  warningIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: FONTS.sizes.hero,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONTS.sizes.xl,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  urlBox: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  urlLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: SPACING.xs,
  },
  urlText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  reasonBox: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  reasonLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: SPACING.xs,
  },
  reasonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    fontWeight: '600',
    lineHeight: 22,
  },
  warningsContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  warningEmoji: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  warningText: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.danger,
    fontWeight: '600',
    lineHeight: 22,
  },
  tipBox: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  tipTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  tipText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  buttonsContainer: {
    width: '100%',
    marginTop: SPACING.md,
  },
  safeButton: {
    backgroundColor: COLORS.safe,
    marginBottom: SPACING.sm,
  },
});

