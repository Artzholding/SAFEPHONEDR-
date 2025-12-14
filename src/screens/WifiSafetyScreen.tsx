/**
 * SafePhone DR - WiFi Safety Screen
 * Displays current WiFi connection security status
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { WifiSecurityInfo } from '../types';
import { scanWifiSecurity, scanWifiSecurityDemo } from '../utils/wifiScanner';
import { WifiStatusCard } from '../components/WifiStatusCard';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { hexToRgba } from '../utils/colors';
import { GradientHeader } from '../components/GradientHeader';
import * as Location from 'expo-location';

export const WifiSafetyScreen: React.FC = () => {
  const { t } = useLanguage();
  const [isScanning, setIsScanning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [wifiInfo, setWifiInfo] = useState<WifiSecurityInfo | null>(null);
  const [demoMode, setDemoMode] = useState<'safe' | 'warning' | 'danger'>('safe');
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const handleScan = useCallback(async () => {
    setIsScanning(true);
    try {
      // Solicitar permiso de ubicación (requerido para SSID en Android)
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionError('Permiso de ubicación requerido para verificar la red actual.');
        setWifiInfo({
          ssid: '',
          isConnected: false,
          isSecure: false,
          encryptionType: 'UNKNOWN',
          hasHttpsDns: false,
          riskLevel: 'warning',
          warnings: ['Concede permiso de ubicación para leer el WiFi actual.'],
        });
        return;
      }
      setPermissionError(null);
      const info = await scanWifiSecurity();
      setWifiInfo(info);
    } catch (error) {
      console.error('WiFi scan error:', error);
    } finally {
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    handleScan();
  }, [handleScan]);

  const onRefresh = async () => {
    setRefreshing(true);
    await handleScan();
    setRefreshing(false);
  };

  // Safety recommendations based on current status
  const recommendations = wifiInfo?.riskLevel === 'safe'
    ? [
        '✅ Tu conexión WiFi es segura',
        '✅ Puedes realizar transacciones bancarias',
        '✅ Tus datos están protegidos',
      ]
    : wifiInfo?.riskLevel === 'warning'
    ? [
        '⚠️ Evita transacciones bancarias en esta red',
        '⚠️ No ingreses contraseñas importantes',
        '⚠️ Usa datos móviles para información sensible',
      ]
    : [
        '🚨 NO uses esta red para banca',
        '🚨 Tus datos pueden ser interceptados',
        '🚨 Desconéctate inmediatamente',
        '🚨 Usa tus datos móviles en su lugar',
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
          title={t('wifiSafety')}
          subtitle="Antes de entrar a tu banco, revisa si tu WiFi es segura."
          rightSlot={<Text style={styles.headerBadge}>📶</Text>}
        />

        {/* WiFi Status Card */}
        {wifiInfo && <WifiStatusCard wifiInfo={wifiInfo} />}

        {/* Recommendations */}
        <Card style={styles.recommendationsCard}>
          <Text style={styles.sectionTitle}>Recomendaciones</Text>
          {recommendations.map((rec, index) => (
            <Text key={index} style={styles.recommendationText}>
              {rec}
            </Text>
          ))}
        </Card>

        {/* Quick Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.sectionTitle}>💡 Consejos para WiFi Seguro</Text>
          
          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>En Casa</Text>
            <Text style={styles.tipText}>
              Usa WPA2 o WPA3 con una contraseña fuerte de al menos 12 caracteres.
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>En Lugares Públicos</Text>
            <Text style={styles.tipText}>
              Evita hacer transacciones bancarias. Usa tus datos móviles para mayor seguridad.
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>Redes Sospechosas</Text>
            <Text style={styles.tipText}>
              Desconfía de redes con nombres como "WiFi Gratis" o que imiten bancos.
            </Text>
          </View>
        </Card>

        {/* Demo Mode Toggle (for testing) */}
        <Card style={styles.demoCard}>
          <Text style={styles.demoTitle}>🧪 Modo Demo</Text>
          <Text style={styles.demoSubtitle}>
            Prueba diferentes escenarios de seguridad
          </Text>
          <View style={styles.demoButtons}>
            <TouchableOpacity
              style={[
                styles.demoButton,
                demoMode === 'safe' && { backgroundColor: COLORS.safe },
              ]}
              onPress={() => setDemoMode('safe')}
            >
              <Text style={styles.demoButtonText}>Seguro</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.demoButton,
                demoMode === 'warning' && { backgroundColor: COLORS.warning },
              ]}
              onPress={() => setDemoMode('warning')}
            >
              <Text style={styles.demoButtonText}>Alerta</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.demoButton,
                demoMode === 'danger' && { backgroundColor: COLORS.danger },
              ]}
              onPress={() => setDemoMode('danger')}
            >
              <Text style={styles.demoButtonText}>Peligro</Text>
            </TouchableOpacity>
          </View>
          <PrimaryButton
            title="Aplicar Demo"
            onPress={async () => {
              setIsScanning(true);
              const info = await scanWifiSecurityDemo(demoMode);
              setWifiInfo(info);
              setIsScanning(false);
            }}
            loading={isScanning}
            size="small"
            style={styles.applyButton}
          />
        </Card>

        {/* Privacy Note */}
        <Text style={styles.privacyNote}>
          🔒 Todas las verificaciones ocurren localmente en tu dispositivo
        </Text>
        {permissionError && (
          <Text style={[styles.privacyNote, { color: COLORS.danger }]}>
            {permissionError}
          </Text>
        )}
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
    fontSize: 26,
    color: COLORS.textOnDark,
  },
  recommendationsCard: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  recommendationText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
  tipsCard: {
    marginBottom: SPACING.md,
  },
  tipItem: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tipTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  tipText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  demoCard: {
    marginBottom: SPACING.md,
    backgroundColor: hexToRgba(COLORS.primaryLight, 0.06),
  },
  demoTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  demoSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginBottom: SPACING.md,
  },
  demoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  demoButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
  },
  demoButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  applyButton: {
    alignSelf: 'center',
  },
  privacyNote: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});

