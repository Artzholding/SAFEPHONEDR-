/**
 * SafePhone DR - Risk Level Badge Component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RiskLevel } from '../types';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'small' | 'medium' | 'large';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'medium' }) => {
  const { t } = useLanguage();

  const getColors = (): { bg: string; text: string; border: string } => {
    switch (level) {
      case 'safe':
        return { bg: COLORS.safeLight, text: COLORS.safe, border: COLORS.safe };
      case 'warning':
        return { bg: COLORS.warningLight, text: COLORS.warning, border: COLORS.warning };
      case 'danger':
        return { bg: COLORS.dangerLight, text: COLORS.danger, border: COLORS.danger };
      default:
        return { bg: COLORS.safeLight, text: COLORS.safe, border: COLORS.safe }; // Fallback to safe
    }
  };

  const getLabel = (): string => {
    switch (level) {
      case 'safe':
        return t('safe');
      case 'warning':
        return t('warning');
      case 'danger':
        return t('danger');
      default:
        return t('safe'); // Fallback to safe
    }
  };

  const getIcon = (): string => {
    switch (level) {
      case 'safe':
        return '✓';
      case 'warning':
        return '⚠';
      case 'danger':
        return '✕';
      default:
        return '✓'; // Fallback to safe
    }
  };

  const colors = getColors();
  const sizeStyles = {
    small: { paddingH: SPACING.xs, paddingV: 2, fontSize: FONTS.sizes.xs },
    medium: { paddingH: SPACING.sm, paddingV: SPACING.xs, fontSize: FONTS.sizes.sm },
    large: { paddingH: SPACING.md, paddingV: SPACING.sm, fontSize: FONTS.sizes.md },
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          paddingHorizontal: sizeStyles[size].paddingH,
          paddingVertical: sizeStyles[size].paddingV,
        },
      ]}
    >
      <Text style={[styles.icon, { color: colors.text, fontSize: sizeStyles[size].fontSize }]}>
        {getIcon()}
      </Text>
      <Text style={[styles.text, { color: colors.text, fontSize: sizeStyles[size].fontSize }]}>
        {getLabel()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  icon: {
    marginRight: SPACING.xs,
    fontWeight: 'bold',
  },
  text: {
    fontWeight: '600',
  },
});

