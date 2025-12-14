/**
 * SafePhone DR - Color Utilities
 * Helper functions for color manipulation in React Native
 */

/**
 * Converts a hex color to rgba format with opacity
 * React Native does not support #RRGGBBAA format, so we must use rgba()
 * 
 * @param hex - Hex color string (e.g., '#00C853' or '00C853')
 * @param opacity - Opacity value from 0 to 1
 * @returns rgba color string (e.g., 'rgba(0, 200, 83, 0.2)')
 */
export function hexToRgba(hex: string, opacity: number): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  // Clamp opacity between 0 and 1
  const clampedOpacity = Math.max(0, Math.min(1, opacity));
  
  return `rgba(${r}, ${g}, ${b}, ${clampedOpacity})`;
}

/**
 * Creates a light tint of a color (for backgrounds)
 * @param hex - Hex color string
 * @param opacity - Opacity value (default 0.1 for subtle tint)
 */
export function createTint(hex: string, opacity: number = 0.1): string {
  return hexToRgba(hex, opacity);
}

/**
 * Creates a medium opacity version of a color
 * @param hex - Hex color string  
 * @param opacity - Opacity value (default 0.2)
 */
export function createOverlay(hex: string, opacity: number = 0.2): string {
  return hexToRgba(hex, opacity);
}

