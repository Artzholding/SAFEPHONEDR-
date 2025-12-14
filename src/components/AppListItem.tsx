/**
 * SafePhone DR - App List Item Component
 * Displays individual app with risk assessment
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScannedApp } from '../types';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { RiskBadge } from './RiskBadge';

interface AppListItemProps {
  app: ScannedApp;
  onPress?: () => void;
}

export const AppListItem: React.FC<AppListItemProps> = ({ app, onPress }) => {
  const getBorderColor = (): string => {
    switch (app.riskLevel) {
      case 'safe':
        return COLORS.safeLight;
      case 'warning':
        return COLORS.warning;
      case 'danger':
        return COLORS.danger;
      default:
        return COLORS.safeLight; // Fallback to safe
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: getBorderColor() }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* App Icon Placeholder */}
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>{app.name.charAt(0).toUpperCase()}</Text>
      </View>

      {/* App Info */}
      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.appName} numberOfLines={1}>
            {app.name}
          </Text>
          <RiskBadge level={app.riskLevel} size="small" />
        </View>

        <Text style={styles.developer} numberOfLines={1}>
          {app.developer}
        </Text>

        {/* Warnings */}
        {app.riskLevel !== 'safe' && app.warningMessage && (
          <View style={styles.warningsContainer}>
            {app.warningMessage.split('\n').map((warning, index) => (
              <Text key={index} style={styles.warningText}>
                {warning}
              </Text>
            ))}
          </View>
        )}

        {/* Dangerous Permissions */}
        {app.dangerousPermissions.length > 0 && (
          <View style={styles.permissionsContainer}>
            <Text style={styles.permissionsLabel}>Permisos peligrosos:</Text>
            <Text style={styles.permissionsText}>
              {app.dangerousPermissions.join(', ')}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    ...SHADOWS.small,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  iconText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  infoContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  appName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  developer: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginBottom: SPACING.xs,
  },
  warningsContainer: {
    marginTop: SPACING.xs,
    padding: SPACING.xs,
    backgroundColor: COLORS.dangerLight,
    borderRadius: RADIUS.sm,
  },
  warningText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.danger,
    marginBottom: 2,
  },
  permissionsContainer: {
    marginTop: SPACING.xs,
  },
  permissionsLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  permissionsText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray,
  },
});

