/**
 * SafePhone DR - Primary Button Component
 */

import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { hexToRgba } from '../utils/colors';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
}) => {
  const getBackgroundColor = (): string => {
    if (disabled) return COLORS.gray;
    switch (variant) {
      case 'primary':
        return COLORS.accent;
      case 'secondary':
        return COLORS.primaryLight;
      case 'danger':
        return COLORS.danger;
      default:
        return COLORS.accent; // Fallback to primary
    }
  };

  const getSizeStyles = (): { paddingV: number; paddingH: number; fontSize: number } => {
    switch (size) {
      case 'small':
        return { paddingV: SPACING.sm, paddingH: SPACING.md, fontSize: FONTS.sizes.sm };
      case 'medium':
        return { paddingV: SPACING.md, paddingH: SPACING.lg, fontSize: FONTS.sizes.md };
      case 'large':
        return { paddingV: SPACING.lg, paddingH: SPACING.xl, fontSize: FONTS.sizes.lg };
      default:
        return { paddingV: SPACING.md, paddingH: SPACING.lg, fontSize: FONTS.sizes.md }; // Fallback to medium
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          paddingVertical: sizeStyles.paddingV,
          paddingHorizontal: sizeStyles.paddingH,
          opacity: disabled ? 0.65 : 1,
        },
        pressed && !disabled ? { transform: [{ scale: 0.99 }], backgroundColor: hexToRgba(getBackgroundColor(), 0.92) } : null,
        style,
      ]}
      hitSlop={10}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <Text style={[styles.text, { fontSize: sizeStyles.fontSize }]}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    ...SHADOWS.small,
  },
  text: {
    color: COLORS.white,
    fontWeight: '700',
  },
});
