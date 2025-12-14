/**
 * SafePhone DR - Design System
 * Modern, trust-inspiring color palette with Dominican flair
 */

export const COLORS = {
  // Primary palette - Deep navy trust colors
  primary: '#0A1628',
  primaryLight: '#1A2D4A',
  primaryDark: '#050B14',
  
  // Accent - Vibrant teal for CTAs
  accent: '#00D4AA',
  accentLight: '#33DDBB',
  accentDark: '#00A888',
  
  // Status colors
  safe: '#00C853',
  safeLight: '#E8F5E9',
  warning: '#FFB300',
  warningLight: '#FFF8E1',
  danger: '#FF3D00',
  dangerLight: '#FFEBEE',
  
  // Neutrals
  white: '#FFFFFF',
  offWhite: '#F5F7FA',
  lightGray: '#E1E5EB',
  gray: '#8A94A6',
  darkGray: '#4A5568',
  black: '#0A0A0A',

  // Modern surfaces (for better UX consistency)
  background: '#F7F8FC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  border: '#E5E7EB',
  text: '#0F172A',
  textMuted: '#64748B',
  textOnDark: '#FFFFFF',
  
  // Gradients endpoints
  gradientStart: '#0A1628',
  gradientEnd: '#1A3A5C',
  
  // Overlay
  overlay: 'rgba(10, 22, 40, 0.85)',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    hero: 36,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

