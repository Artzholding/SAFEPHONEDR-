/**
 * SafePhone DR - WiFi Status Card Component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WifiSecurityInfo } from '../types';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { RiskBadge } from './RiskBadge';
import { useLanguage } from '../context/LanguageContext';
import { hexToRgba } from '../utils/colors';
import { PrimaryButton } from './PrimaryButton';

interface WifiStatusCardProps {
  wifiInfo: WifiSecurityInfo;
}

export const WifiStatusCard: React.FC<WifiStatusCardProps> = ({ wifiInfo }) => {
  const { t } = useLanguage();

  const getStatusColor = (): string => {
    switch (wifiInfo.riskLevel) {
      case 'safe':
        return COLORS.safe;
      case 'warning':
        return COLORS.warning;
      case 'danger':
        return COLORS.danger;
      default:
        return COLORS.safe; // Fallback to safe
    }
  };

  const getEncryptionLabel = () => {
    switch (wifiInfo.encryptionType) {
      case 'WPA3':
        return 'WPA3 (Muy Seguro)';
      case 'WPA2':
        return 'WPA2 (Seguro)';
      case 'WPA':
        return 'WPA (Básico)';
      case 'WEP':
        return 'WEP (Inseguro)';
      case 'OPEN':
        return 'Abierta (¡Peligro!)';
      default:
        return 'Desconocido';
    }
  };

  const statusColor = getStatusColor();

  return (
    <View style={[styles.container, { borderColor: statusColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={styles.statusText}>
            {wifiInfo.isConnected ? t('connected') : t('notConnected')}
          </Text>
        </View>
        <RiskBadge level={wifiInfo.riskLevel} />
      </View>

      {/* Network Details */}
      {wifiInfo.isConnected && (
        <>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📶 {t('networkName')}</Text>
            <Text style={styles.detailValue}>{wifiInfo.ssid}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🔐 {t('encryption')}</Text>
            <Text
              style={[
                styles.detailValue,
                wifiInfo.encryptionType === 'OPEN' && styles.dangerText,
              ]}
            >
              {getEncryptionLabel()}
            </Text>
          </View>

          {/* Warnings */}
          {wifiInfo.warnings.length > 0 && (
            <View style={styles.warningsContainer}>
              {wifiInfo.warnings.map((warning, index) => (
                <Text key={index} style={styles.warningText}>
                  ⚠️ {warning}
                </Text>
              ))}
            </View>
          )}
        </>
      )}

      {/* Status Message */}
      <View style={[styles.statusMessage, { backgroundColor: hexToRgba(statusColor, 0.12) }]}>
        <Text style={[styles.statusMessageText, { color: statusColor }]}>
          {wifiInfo.riskLevel === 'safe' && t('wifiSafe')}
          {wifiInfo.riskLevel === 'warning' && t('wifiWarning')}
          {wifiInfo.riskLevel === 'danger' && t('wifiDanger')}
        </Text>
      </View>

      {/* Recommendation CTA */}
      {wifiInfo.riskLevel !== 'safe' && (
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>Recomendación</Text>
          <Text style={styles.tipText}>
            Usa datos móviles o una VPN si necesitas hacer banca o compras en esta red.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 2,
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  statusText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  detailLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
  },
  detailValue: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  dangerText: {
    color: COLORS.danger,
  },
  warningsContainer: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.warningLight,
    borderRadius: RADIUS.sm,
  },
  warningText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.warning,
    marginBottom: SPACING.xs,
  },
  tipBox: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.offWhite,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  tipTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  tipText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 18,
  },
  statusMessage: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  statusMessageText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
  },
});

