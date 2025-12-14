/**
 * SafePhone DR - Gradient Header
 * Modern look with a trust-focused gradient (DR vibe).
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
}

export const GradientHeader: React.FC<GradientHeaderProps> = ({
  title,
  subtitle,
  rightSlot
}) => {
  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.row}>
        <View style={styles.textCol}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  textCol: {
    flex: 1,
    paddingRight: SPACING.md
  },
  rightSlot: {
    alignItems: "flex-end"
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: "800",
    color: COLORS.white,
    marginBottom: SPACING.xs
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20
  }
});


