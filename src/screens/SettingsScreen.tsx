/**
 * SafePhone DR - Settings Screen
 * Language selection and app information
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { Card } from '../components/Card';
import { Language } from '../types';
import { hexToRgba } from '../utils/colors';
import { GradientHeader } from '../components/GradientHeader';

const PRIVACY_URL = 'https://example.com/privacy'; // Reemplazar por URL real
const TERMS_URL = 'https://example.com/terms'; // Reemplazar por URL real

export const SettingsScreen: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GradientHeader
          title={t('settings')}
          subtitle="Privacidad, idioma y detalles de SafePhone DR."
          rightSlot={<Text style={styles.headerBadge}>⚙️</Text>}
        />

        {/* Language Selection */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 {t('language')}</Text>
          
          <TouchableOpacity
            style={[
              styles.languageOption,
              language === 'es' && styles.languageOptionActive,
            ]}
            onPress={() => handleLanguageChange('es')}
          >
            <Text style={styles.languageFlag}>🇩🇴</Text>
            <View style={styles.languageInfo}>
              <Text
                style={[
                  styles.languageName,
                  language === 'es' && styles.languageNameActive,
                ]}
              >
                {t('spanish')}
              </Text>
              <Text style={styles.languageDesc}>Español (República Dominicana)</Text>
            </View>
            {language === 'es' && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.languageOption,
              language === 'en' && styles.languageOptionActive,
            ]}
            onPress={() => handleLanguageChange('en')}
          >
            <Text style={styles.languageFlag}>🇺🇸</Text>
            <View style={styles.languageInfo}>
              <Text
                style={[
                  styles.languageName,
                  language === 'en' && styles.languageNameActive,
                ]}
              >
                {t('english')}
              </Text>
              <Text style={styles.languageDesc}>English</Text>
            </View>
            {language === 'en' && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        </Card>

        {/* Legal */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>📄 Política y Términos</Text>
          <View style={styles.linkItem}>
            <Text style={styles.linkLabel}>Política de Privacidad</Text>
            <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)}>
              <Text style={styles.linkValue}>{PRIVACY_URL}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.linkItem}>
            <Text style={styles.linkLabel}>Términos y Condiciones</Text>
            <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)}>
              <Text style={styles.linkValue}>{TERMS_URL}</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Privacy Information */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 {t('privacyNote')}</Text>
          <View style={styles.privacyContent}>
            <Text style={styles.privacyIcon}>🛡️</Text>
            <Text style={styles.privacyText}>{t('privacyDescription')}</Text>
          </View>
          
          <View style={styles.privacyList}>
            <Text style={styles.privacyItem}>✓ Sin recolección de datos</Text>
            <Text style={styles.privacyItem}>✓ Sin conexión a servidores externos</Text>
            <Text style={styles.privacyItem}>✓ Todo el análisis es local</Text>
            <Text style={styles.privacyItem}>✓ No se comparte información</Text>
          </View>
        </Card>

        {/* About Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ {t('about')}</Text>
          
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>SafePhone DR</Text>
            <Text style={styles.aboutValue}>{t('version')} 1.0.0</Text>
          </View>

          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Propósito</Text>
            <Text style={styles.aboutDesc}>
              Proteger a los usuarios en la República Dominicana contra estafas 
              telefónicas, phishing bancario y apps maliciosas.
            </Text>
          </View>

          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Desarrollado para</Text>
            <Text style={styles.aboutDesc}>
              Comunidades vulnerables en RD que necesitan protección contra 
              fraudes digitales.
            </Text>
          </View>
        </Card>

        {/* Features Overview */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Funcionalidades</Text>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔍</Text>
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Escáner de Apps</Text>
              <Text style={styles.featureDesc}>
                Detecta apps con permisos peligrosos y desarrolladores desconocidos
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🌐</Text>
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Detector de Phishing</Text>
              <Text style={styles.featureDesc}>
                Identifica sitios falsos que imitan bancos dominicanos
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📶</Text>
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>WiFi Seguro</Text>
              <Text style={styles.featureDesc}>
                Verifica la seguridad de tu conexión WiFi actual
              </Text>
            </View>
          </View>
        </Card>

        {/* Future Features Placeholder */}
        <Card style={[styles.section, styles.futureSection]}>
          <Text style={styles.sectionTitle}>🚀 Próximamente</Text>
          <Text style={styles.futureText}>
            • Detección de SMS de phishing{'\n'}
            • Identificación de llamadas fraudulentas{'\n'}
            • Análisis de malware en tiempo real{'\n'}
            • Reportes de seguridad personalizados
          </Text>
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Hecho con ❤️ para la República Dominicana
          </Text>
          <Text style={styles.copyrightText}>
            © 2024 SafePhone DR - Todos los derechos reservados
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  headerBadge: {
    fontSize: 24,
    color: COLORS.textOnDark,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.offWhite,
    marginBottom: SPACING.sm,
  },
  languageOptionActive: {
    backgroundColor: hexToRgba(COLORS.accent, 0.12),
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  languageFlag: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  languageNameActive: {
    color: COLORS.accent,
  },
  languageDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
  },
  checkmark: {
    fontSize: FONTS.sizes.xl,
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  privacyContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  privacyIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  privacyText: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    lineHeight: 22,
  },
  privacyList: {
    backgroundColor: COLORS.safeLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  privacyItem: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.safe,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  aboutItem: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  aboutLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  aboutValue: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
  },
  aboutDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  featureDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    lineHeight: 18,
  },
  linkItem: {
    marginBottom: SPACING.sm,
  },
  linkLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginBottom: SPACING.xs,
  },
  linkValue: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.accentDark,
    textDecorationLine: 'underline',
  },
  futureSection: {
    backgroundColor: hexToRgba(COLORS.primaryLight, 0.06),
  },
  futureText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primaryLight,
    lineHeight: 24,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  footerText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  copyrightText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray,
  },
});

