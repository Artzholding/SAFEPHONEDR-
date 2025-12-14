/**
 * SafePhone DR - App Scanner Screen
 * Scans and displays installed apps with security analysis
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { ScannedApp, RiskLevel } from '../types';
import { scanInstalledApps, getAppScanSummary } from '../utils/appScanner';
import { AppListItem } from '../components/AppListItem';
import { PrimaryButton } from '../components/PrimaryButton';
import { Card } from '../components/Card';
import { GradientHeader } from '../components/GradientHeader';
import { SegmentedControl } from '../components/SegmentedControl';

type FilterType = 'all' | 'danger' | 'warning' | 'safe';

export const AppScannerScreen: React.FC = () => {
  const { t } = useLanguage();
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [apps, setApps] = useState<ScannedApp[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [recentOnly, setRecentOnly] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');
  const [quickResult, setQuickResult] = useState<ScannedApp | null>(null);

  const handleScan = useCallback(async () => {
    setIsScanning(true);
    try {
      const scannedApps = await scanInstalledApps();
      setApps(scannedApps);
      setHasScanned(true);
    } catch (error) {
      console.error('Scan error:', error);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const summary = getAppScanSummary(apps);

  const filteredApps = apps
    .filter((app) => {
      if (filter === 'all') return true;
      return app.riskLevel === filter;
    })
    .filter((app) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        app.name.toLowerCase().includes(q) ||
        app.packageName.toLowerCase().includes(q) ||
        app.developer.toLowerCase().includes(q)
      );
    })
    .filter((app) => {
      if (!recentOnly) return true;
      if (!app.firstInstallTime) return false;
      const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;
      return Date.now() - app.firstInstallTime <= THIRTY_DAYS;
    });

const handleQuickCheck = () => {
  if (!quickQuery.trim()) {
    setQuickResult(null);
    Alert.alert('Ingresa un nombre o paquete para verificar.');
    return;
  }
  const q = quickQuery.toLowerCase();
  const match = apps.find(
    (app) =>
      app.name.toLowerCase().includes(q) ||
      app.packageName.toLowerCase().includes(q) ||
      app.developer.toLowerCase().includes(q)
  );
  if (match) {
    setQuickResult(match);
  } else {
    setQuickResult(null);
    Alert.alert('No encontrado', 'No se encontró esa app en el dispositivo.');
  }
};

  const filterButtons: Array<{ key: FilterType; label: string; count: number }> = [
    { key: 'all', label: `Todas (${summary.total})`, count: summary.total },
    { key: 'danger', label: `Peligro (${summary.danger})`, count: summary.danger },
    { key: 'warning', label: `Alerta (${summary.warning})`, count: summary.warning },
    { key: 'safe', label: `Seguras (${summary.safe})`, count: summary.safe },
  ];

  const renderSummaryCard = () => (
    <Card style={styles.summaryCard} variant="elevated">
      <Text style={styles.summaryTitle}>{t('appsScanned')}</Text>
      <View style={styles.summaryStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: COLORS.primary }]}>
            {summary.total}
          </Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: COLORS.danger }]}>
            {summary.danger}
          </Text>
          <Text style={styles.statLabel}>{t('riskyApps')}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: COLORS.warning }]}>
            {summary.warning}
          </Text>
          <Text style={styles.statLabel}>{t('warning')}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: COLORS.safe }]}>
            {summary.safe}
          </Text>
          <Text style={styles.statLabel}>{t('safeApps')}</Text>
        </View>
      </View>
    </Card>
  );

  const renderFilterBar = () => (
    <View style={styles.filterBar}>
      <SegmentedControl
        value={filter}
        options={filterButtons.map((b) => ({ key: b.key, label: b.label }))}
        onChange={setFilter}
      />
    </View>
  );

  // Initial scan screen
  if (!hasScanned) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centeredContent}>
          <Text style={styles.heroIcon}>🔍</Text>
          <Text style={styles.heroTitle}>{t('appScanner')}</Text>
          <Text style={styles.heroSubtitle}>
            Analiza las apps instaladas en tu dispositivo para detectar riesgos de seguridad.
          </Text>
          <PrimaryButton
            title={isScanning ? t('scanningApps') : t('scanNow')}
            onPress={handleScan}
            loading={isScanning}
            size="large"
            style={styles.scanButton}
          />
          <Text style={styles.privacyNote}>
            🔒 Todo el escaneo ocurre localmente en tu dispositivo
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerWrap}>
        <GradientHeader
          title={t('appScanner')}
          subtitle="Detecta apps falsas, permisos peligrosos y APKs fuera de Play Store."
          rightSlot={
            <TouchableOpacity onPress={handleScan} disabled={isScanning} hitSlop={10}>
              <Text style={styles.rescanButton}>{isScanning ? '⏳' : '🔄'} Re-escanear</Text>
            </TouchableOpacity>
          }
        />
      </View>

      {isScanning ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>{t('scanningApps')}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredApps}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AppListItem app={item} />}
          ListHeaderComponent={
            <>
          {renderSummaryCard()}
              {renderFilterBar()}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Verificación rápida de app</Text>
            <Text style={styles.sectionSubtitle}>
              Escribe el nombre o paquete para revisar sólo esa app.
            </Text>
            <TextInput
              style={styles.searchInput}
              placeholder="ej: com.whatsapp"
              placeholderTextColor={COLORS.gray}
              value={quickQuery}
              onChangeText={setQuickQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <PrimaryButton
              title="Verificar app"
              onPress={handleQuickCheck}
              size="small"
              style={styles.quickButton}
            />
            {quickResult && (
              <View style={styles.quickResultBox}>
                <AppListItem app={quickResult} />
              </View>
            )}
          </Card>
              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar app o paquete..."
                  placeholderTextColor={COLORS.gray}
                  value={search}
                  onChangeText={setSearch}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleChip,
                  recentOnly && styles.toggleChipActive,
                ]}
                onPress={() => setRecentOnly(!recentOnly)}
              >
                <Text
                  style={[
                    styles.toggleChipText,
                    recentOnly && styles.toggleChipTextActive,
                  ]}
                >
                  {recentOnly ? '✓ Solo apps nuevas (30 días)' : 'Solo apps nuevas (30 días)'}
                </Text>
              </TouchableOpacity>
              {summary.danger === 0 && summary.warning === 0 && (
                <Card style={styles.successCard}>
                  <Text style={styles.successText}>
                    ✅ {t('noRiskyApps')}
                  </Text>
                </Card>
              )}
            </>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerWrap: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  rescanButton: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textOnDark,
    fontWeight: '800',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  heroIcon: {
    fontSize: 72,
    marginBottom: SPACING.lg,
  },
  heroTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  scanButton: {
    minWidth: 200,
  },
  privacyNote: {
    marginTop: SPACING.lg,
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.gray,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  summaryCard: {
    marginBottom: SPACING.md,
  },
  summaryTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },
  filterBar: {
    marginBottom: SPACING.md,
  },
  successCard: {
    backgroundColor: COLORS.safeLight,
    marginBottom: SPACING.md,
  },
  successText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.safe,
    textAlign: 'center',
    fontWeight: '600',
  },
  searchRow: {
    marginBottom: SPACING.sm,
  },
  searchInput: {
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.primary,
  },
  toggleChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginBottom: SPACING.sm,
  },
  toggleChipActive: {
    backgroundColor: COLORS.safeLight,
    borderColor: COLORS.safe,
  },
  toggleChipText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
  },
  toggleChipTextActive: {
    color: COLORS.safe,
    fontWeight: '700',
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginBottom: SPACING.sm,
  },
  quickButton: {
    marginTop: SPACING.sm,
  },
  quickResultBox: {
    marginTop: SPACING.sm,
  },
});

