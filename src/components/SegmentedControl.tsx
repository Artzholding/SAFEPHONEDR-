/**
 * SafePhone DR - Segmented Control
 * Modern filter UX for lists (apps, etc).
 */

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { COLORS, FONTS, RADIUS, SPACING } from "../constants/theme";
import { hexToRgba } from "../utils/colors";

export interface SegmentedOption<T extends string> {
  key: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: Array<SegmentedOption<T>>;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={({ pressed }) => [
              styles.item,
              active && styles.itemActive,
              pressed && !active && { backgroundColor: hexToRgba(COLORS.primary, 0.05) }
            ]}
            hitSlop={8}
          >
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.full,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  item: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center"
  },
  itemActive: {
    backgroundColor: COLORS.primary
  },
  label: {
    fontSize: FONTS.sizes.xs,
    fontWeight: "700",
    color: COLORS.textMuted
  },
  labelActive: {
    color: COLORS.textOnDark
  }
});


