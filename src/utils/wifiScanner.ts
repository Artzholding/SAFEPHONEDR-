/**
 * SafePhone DR - WiFi Security Scanner
 * 
 * Checks the current WiFi connection for security risks.
 * Uses Expo Network API for basic connectivity info.
 * 
 * PRIVACY: All checks are performed locally. No data leaves the device.
 */

import * as Network from 'expo-network';
import { NativeModules, Platform } from 'react-native';
import { WifiSecurityInfo, RiskLevel } from '../types';
import type { NativeWifiInfo } from '../types/wifi-native';

const PUBLIC_HINTS = ['guest', 'gratis', 'free', 'public', 'wifi', 'café', 'plaza', 'mall', 'hotspot', 'airport'];

/**
 * Analyze WiFi security and return risk assessment
 */
function analyzeWifiSecurity(
  isConnected: boolean,
  ssid: string,
  encryptionType: WifiSecurityInfo['encryptionType']
): { riskLevel: RiskLevel; warnings: string[] } {
  const warnings: string[] = [];
  const enc = encryptionType.toUpperCase();

  if (!isConnected) {
    return { riskLevel: 'safe', warnings: [] };
  }

  // Clasificación por cifrado
  let riskLevel: RiskLevel = 'safe';
  if (enc === 'OPEN' || enc === 'WEP' || enc.includes('TKIP')) {
    riskLevel = 'danger';
  } else if (enc === 'WPA' || enc === 'UNKNOWN') {
    riskLevel = 'warning';
  } else {
    riskLevel = 'safe'; // WPA2/WPA3
  }

  // Warnings específicos
  if (enc === 'OPEN') {
    warnings.push('Red abierta: riesgo de interceptación. Evita banca/compras; usa datos o VPN.');
  }
  if (enc === 'WEP' || enc.includes('TKIP')) {
    warnings.push('Cifrado débil (WEP/TKIP). Evita datos sensibles.');
  }
  if (enc === 'WPA' || enc === 'UNKNOWN') {
    warnings.push('Cifrado desconocido. Precaución con datos sensibles.');
  }

  // DNS/HTTPS (simulado)
  // En Expo no se puede verificar, pero mantenemos el flag para UI
  // El caller puede decidir setear hasHttpsDns=false para redes abiertas.

  // Nombre de red pública
  const ssidLower = ssid.toLowerCase();
  if (enc === 'OPEN' && PUBLIC_HINTS.some((h) => ssidLower.includes(h))) {
    warnings.push('Posible red pública/portal cautivo. No ingreses datos sensibles.');
  }

  return { riskLevel, warnings };
}

/**
 * Get encryption type label for display
 */
function getEncryptionLabel(type: WifiSecurityInfo['encryptionType']): string {
  const labels: Record<WifiSecurityInfo['encryptionType'], string> = {
    WPA3: 'WPA3 (Muy Seguro)',
    WPA2: 'WPA2 (Seguro)',
    WPA: 'WPA (Básico)',
    WEP: 'WEP (Inseguro)',
    OPEN: 'Abierta (Sin Contraseña)',
    UNKNOWN: 'Desconocido',
  };
  return labels[type];
}

/**
 * Scan current WiFi connection for security issues
 * 
 * Note: Expo Network API has limited access to WiFi details.
 * In production, native modules would provide more info.
 */
export async function scanWifiSecurity(): Promise<WifiSecurityInfo> {
  // 1) Intentar nativo en Android
  if (Platform.OS === 'android') {
    const nativeInfo = await getNativeWifiInfo();
    if (nativeInfo) {
      const enc = mapNativeEncryption(nativeInfo.encryptionType);
      const { riskLevel, warnings } = analyzeWifiSecurity(true, nativeInfo.ssid, enc);
      return {
        ssid: nativeInfo.ssid,
        isConnected: nativeInfo.isConnected,
        isSecure: riskLevel === 'safe',
        encryptionType: enc,
        hasHttpsDns: enc === 'WPA3' || enc === 'WPA2',
        riskLevel,
        warnings,
      };
    }
  }

  try {
    // Get network state from Expo
    const networkState = await Network.getNetworkStateAsync();
    
    // Check if connected to WiFi
    const isConnected = networkState.isConnected && 
                       networkState.type === Network.NetworkStateType.WIFI;

    // In a real implementation, we would get actual SSID and encryption
    // For this MVP, we simulate based on connection status
    
    if (!isConnected) {
      return {
        ssid: '',
        isConnected: false,
        isSecure: true,
        encryptionType: 'UNKNOWN',
        hasHttpsDns: false,
        riskLevel: 'safe',
        warnings: [],
      };
    }

    // Simulate getting WiFi details (in production, use native module)
    // For demo, randomly simulate different scenarios
    const mockScenarios: Array<{ ssid: string; encryption: WifiSecurityInfo['encryptionType'] }> = [
      { ssid: 'Casa_WiFi_5G', encryption: 'WPA2' },
      { ssid: 'MiRed_Segura', encryption: 'WPA3' },
      { ssid: 'WIFI_GRATIS_CENTRO', encryption: 'OPEN' },
      { ssid: 'Hotel_Guest', encryption: 'WPA' },
    ];

    // For consistent demo, use first safe scenario by default
    const scenario = mockScenarios[0];
    
    const { riskLevel, warnings } = analyzeWifiSecurity(true, scenario.ssid, scenario.encryption);

    return {
      ssid: scenario.ssid,
      isConnected: true,
      isSecure: riskLevel === 'safe',
      encryptionType: scenario.encryption,
      hasHttpsDns: scenario.encryption === 'WPA3' || scenario.encryption === 'WPA2',
      riskLevel,
      warnings,
    };
  } catch (error) {
    console.error('WiFi scan error:', error);
    return {
      ssid: 'Error',
      isConnected: false,
      isSecure: false,
      encryptionType: 'UNKNOWN',
      hasHttpsDns: false,
      riskLevel: 'warning',
      warnings: ['No se pudo verificar la conexión WiFi'],
    };
  }
}

/**
 * Get a demo WiFi scan with specific scenario
 * Useful for testing different security states
 */
export async function scanWifiSecurityDemo(
  scenario: 'safe' | 'warning' | 'danger'
): Promise<WifiSecurityInfo> {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const scenarios: Record<string, WifiSecurityInfo> = {
    safe: {
      ssid: 'MiCasa_5G_Segura',
      isConnected: true,
      isSecure: true,
      encryptionType: 'WPA3',
      hasHttpsDns: true,
      riskLevel: 'safe',
      warnings: [],
    },
    warning: {
      ssid: 'Cafe_Internet',
      isConnected: true,
      isSecure: false,
      encryptionType: 'WPA',
      hasHttpsDns: false,
      riskLevel: 'warning',
      warnings: [
        'Encriptación WPA antigua - considera no hacer transacciones bancarias',
        'Sin protección DNS - tus búsquedas podrían ser visibles',
      ],
    },
    danger: {
      ssid: 'WIFI_GRATIS_PLAZA',
      isConnected: true,
      isSecure: false,
      encryptionType: 'OPEN',
      hasHttpsDns: false,
      riskLevel: 'danger',
      warnings: [
        'Red sin contraseña - cualquiera puede ver tu tráfico',
        'NO uses esta red para bancos o datos personales',
        'Hackers pueden interceptar tus contraseñas',
      ],
    },
  };

  return scenarios[scenario];
}

function mapNativeEncryption(enc: string): WifiSecurityInfo['encryptionType'] {
  const e = enc.toUpperCase();
  if (e.includes('WPA3')) return 'WPA3';
  if (e.includes('WPA2')) return 'WPA2';
  if (e.includes('WPA')) return 'WPA';
  if (e.includes('WEP')) return 'WEP';
  if (e.includes('OPEN')) return 'OPEN';
  return 'UNKNOWN';
}

async function getNativeWifiInfo(): Promise<NativeWifiInfo | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = NativeModules.WifiInfoNative || require('react-native-wifi-info-native');
    if (!mod || !mod.getCurrentWifiInfo) return null;
    const info = await mod.getCurrentWifiInfo();
    if (!info || !info.isConnected) return null;
    return info as NativeWifiInfo;
  } catch (e) {
    console.warn('Wifi native info not available', e);
    return null;
  }
}

