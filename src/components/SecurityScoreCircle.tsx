/**
 * SafePhone DR - Security Score Circle Component
 * Visual indicator of overall device security
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';

interface SecurityScoreCircleProps {
  score: number; // 0-100
  size?: number;
}

export const SecurityScoreCircle: React.FC<SecurityScoreCircleProps> = ({ 
  score, 
  size = 160 
}) => {
  const getScoreColor = () => {
    if (score >= 80) return COLORS.safe;
    if (score >= 50) return COLORS.warning;
    return COLORS.danger;
  };

  const getScoreLabel = () => {
    if (score >= 80) return '✓ Protegido';
    if (score >= 50) return '⚠ Revisar';
    return '✕ En Riesgo';
  };

  const color = getScoreColor();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer ring */}
      <View
        style={[
          styles.outerRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
          },
        ]}
      />
      
      {/* Inner circle */}
      <View
        style={[
          styles.innerCircle,
          {
            width: size - 16,
            height: size - 16,
            borderRadius: (size - 16) / 2,
          },
        ]}
      >
        <Text style={[styles.scoreText, { color }]}>{score}</Text>
        <Text style={[styles.labelText, { color }]}>{getScoreLabel()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    borderWidth: 4,
    backgroundColor: 'transparent',
  },
  innerCircle: {
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreText: {
    fontSize: FONTS.sizes.hero,
    fontWeight: 'bold',
  },
  labelText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
});

