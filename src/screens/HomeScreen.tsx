/**
 * SafePhone DR - Home Dashboard Screen
 * Central hub showing security overview and quick actions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { SecurityScoreCircle } from '../components/SecurityScoreCircle';
import { Card } from '../components/Card';
import { GradientHeader } from '../components/GradientHeader';
import { RootStackParamList } from '../types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const { t } = useLanguage();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [securityScore, setSecurityScore] = useState(78);
  const [lastScanDate, setLastScanDate] = useState<Date | null>(null);

  // Simulate loading security status
  useEffect(() => {
    loadSecurityStatus();
  }, []);

  const loadSecurityStatus = async () => {
    // In production, this would load actual security data
    setSecurityScore(78);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSecurityStatus();
    setRefreshing(false);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return t('never');
    return date.toLocaleDateString('es-DO', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Security tips data
  // Consejos de seguridad específicos para República Dominicana
  const securityTips = [
    { id: '1', icon: '📱', title: t('tip1Title'), desc: t('tip1Desc') }, // WhatsApp
    { id: '2', icon: '⬇️', title: t('tip2Title'), desc: t('tip2Desc') }, // APKs
    { id: '3', icon: '📶', title: t('tip3Title'), desc: t('tip3Desc') }, // WiFi público
    { id: '4', icon: '🔗', title: t('tip4Title'), desc: t('tip4Desc') }, // .com.do
    { id: '5', icon: '🚫', title: t('tip5Title'), desc: t('tip5Desc') }, // Permisos SMS
    { id: '6', icon: '🎁', title: t('tip6Title'), desc: t('tip6Desc') }, // Premios falsos
    { id: '7', icon: '📞', title: t('tip7Title'), desc: t('tip7Desc') }, // Llamadas falsas
  ];

  // Quick action buttons
  const quickActions = [
    {
      id: 'wifi',
      icon: '📶',
      label: t('wifiSafety'),
      color: COLORS.primaryLight,
      onPress: () => navigation.navigate('MainTabs', { screen: 'WifiSafety' } as any),
    },
    {
      id: 'browser',
      icon: '🌐',
      label: t('browser'),
      color: COLORS.primary,
      onPress: () => navigation.navigate('SecureBrowser', {}),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Header */}
        <GradientHeader
          title="SafePhone DR"
          subtitle={t('welcomeSubtitle')}
          rightSlot={<Text style={styles.headerBadge}>🇩🇴</Text>}
        />

        {/* Security Score Card */}
        <Card style={styles.scoreCard} variant="elevated">
          <Text style={styles.sectionTitle}>{t('securityScore')}</Text>
          <View style={styles.scoreContainer}>
            <SecurityScoreCircle score={securityScore} size={140} />
          </View>
          <Text style={styles.lastScanText}>
            {t('lastScan')}: {formatDate(lastScanDate)}
          </Text>
        </Card>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
        <View style={styles.actionsContainer}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionButton, { backgroundColor: action.color }]}
              onPress={action.onPress}
              activeOpacity={0.8}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Security Tips */}
        <Text style={styles.sectionTitle}>{t('securityTips')}</Text>
        {securityTips.map((tip) => (
          <Card key={tip.id} style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Text style={styles.tipIcon}>{tip.icon}</Text>
              <Text style={styles.tipTitle}>{tip.title}</Text>
            </View>
            <Text style={styles.tipDesc}>{tip.desc}</Text>
          </Card>
        ))}

        {/* Footer Spacing */}
        <View style={styles.footer} />
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
  },
  headerBadge: {
    fontSize: 28,
    color: COLORS.white,
  },
  scoreCard: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  scoreContainer: {
    marginVertical: SPACING.lg,
  },
  lastScanText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  actionLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
  },
  tipCard: {
    marginBottom: SPACING.sm,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  tipTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  tipDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  footer: {
    height: SPACING.xxl,
  },
});

