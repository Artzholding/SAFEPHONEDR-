/**
 * SafePhone DR - App Scanner Utility
 * 
 * Scans installed apps for security risks.
 * Note: On real Android, this would use native modules to get actual installed apps.
 * This MVP uses mock data that simulates realistic scanning results.
 * 
 * PRIVACY: All scanning happens locally on device. No data is sent anywhere.
 */

import { ScannedApp, RiskLevel } from '../types';
import { Platform, NativeModules } from 'react-native';

// Permissions considered dangerous in the Dominican Republic scam context
const DANGEROUS_PERMISSIONS = [
  'android.permission.READ_SMS',
  'android.permission.SEND_SMS',
  'android.permission.RECEIVE_SMS',
  'android.permission.READ_CALL_LOG',
  'android.permission.BIND_ACCESSIBILITY_SERVICE',
  'android.permission.SYSTEM_ALERT_WINDOW',
  'android.permission.READ_CONTACTS',
  'android.permission.WRITE_CONTACTS',
  'android.permission.RECORD_AUDIO',
  'android.permission.CAMERA',
];

// Known safe developers (bancos y vendors globales comunes)
const KNOWN_SAFE_DEVELOPERS = [
  'Google',
  'Google LLC',
  'Meta Platforms',
  'WhatsApp',
  'Facebook',
  'Microsoft',
  'Samsung',
  'Amazon',
  'Apple',
  'Adobe',
  'Netflix',
  'Spotify',
  'TikTok',
  'ByteDance',
  'HUAWEI',
  'Xiaomi',
  'OnePlus',
  'LG',
  'Sony',
  'NVIDIA',
  'Intel',
  'Oracle',
  'Cisco',
  'Zoom',
  'Slack',
  'Banco Popular Dominicano',
  'Banreservas',
  'Banco BHD León',
  'Scotiabank',
  'APAP',
  'Banco Caribe',
  'Banco Santa Cruz',
  'BLH',
  'BDI',
  'La Nacional',
  'ACAP',
  'Banesco',
];

/**
 * Analyzes an app for security risks
 */
function analyzeAppRisk(app: Partial<ScannedApp>): RiskLevel {
  // Apps del sistema sin permisos peligrosos → seguras
  const dangerousCount = app.dangerousPermissions?.length || 0;
  if (app.systemApp && dangerousCount === 0) return 'safe';

  let riskScore = 0;

  // Instaladas fuera de Play
  if (!app.isFromPlayStore) {
    riskScore += 2;
  }

  // Permisos peligrosos
  riskScore += dangerousCount;

  // Desarrollador no verificado: sólo suma si además no es de Play o tiene permisos peligrosos
  const isKnownDev = app.developer
    ? KNOWN_SAFE_DEVELOPERS.some((d) => app.developer!.toLowerCase().includes(d.toLowerCase()))
    : false;
  if (!isKnownDev && (!app.isFromPlayStore || dangerousCount > 0)) {
    riskScore += 1;
  }

  if (riskScore >= 4) return 'danger';
  if (riskScore >= 2) return 'warning';
  return 'safe';
}

/**
 * Generate warning message based on app risks
 */
function generateWarningMessage(app: ScannedApp, lang: 'es' | 'en'): string {
  const warnings: string[] = [];

  if (!app.isFromPlayStore) {
    warnings.push(
      lang === 'es'
        ? '⚠️ Instalada fuera de Play Store'
        : '⚠️ Installed outside Play Store'
    );
  }

  if (app.dangerousPermissions.length > 0) {
    warnings.push(
      lang === 'es'
        ? `⚠️ Solicita ${app.dangerousPermissions.length} permisos peligrosos`
        : `⚠️ Requests ${app.dangerousPermissions.length} dangerous permissions`
    );
  }

  const isKnownDev = KNOWN_SAFE_DEVELOPERS.some((d) =>
    app.developer.toLowerCase().includes(d.toLowerCase())
  );
  if (!isKnownDev && (!app.isFromPlayStore || app.dangerousPermissions.length > 0)) {
    warnings.push(lang === 'es' ? '⚠️ Desarrollador no verificado' : '⚠️ Unverified developer');
  }

  return warnings.join('\n');
}

/**
 * Mock function to simulate scanning installed apps
 * In a real implementation, this would use native Android APIs
 */
export async function scanInstalledApps(): Promise<ScannedApp[]> {
  try {
    const InstalledApps = safeRequireInstalledApps();

    if (Platform.OS === 'android' && InstalledApps?.getInstalledApps) {
      try {
        const nativeApps = await InstalledApps.getInstalledApps(true);
        const mapped: ScannedApp[] = nativeApps.map((app: any) => {
          const developerGuess = app.packageName?.split('.')?.[1] || 'Desconocido';
          const base: ScannedApp = {
            id: app.packageName,
            name: app.appName || app.packageName,
            packageName: app.packageName,
            developer: developerGuess,
            isFromPlayStore: !app.systemApp,
            permissions: [],
            dangerousPermissions: [],
            systemApp: app.systemApp ?? false,
            firstInstallTime: app.firstInstallTime,
            lastUpdateTime: app.lastUpdateTime,
            installerPackage: app.installerPackage,
            riskLevel: 'safe',
          };
          const riskLevel = analyzeAppRisk(base);
          const warningMessage = riskLevel !== 'safe' ? generateWarningMessage(base, 'es') : '';
          return {
            ...base,
            riskLevel,
            warningMessage,
          };
        });
        if (mapped.length > 0) return mapped;
      } catch (err) {
        console.warn('Fallo escaneo nativo, usando mock:', err);
      }
    }
  } catch (err) {
    console.warn('Error inesperado en escaneo de apps, usando mock:', err);
  }

  // Mock data (fallback). En producción real se usa el módulo nativo con QUERY_ALL_PACKAGES.
  await new Promise(resolve => setTimeout(resolve, 500));

  const mockApps: ScannedApp[] = [
    {
      id: '1',
      name: 'WhatsApp',
      packageName: 'com.whatsapp',
      developer: 'WhatsApp LLC',
      isFromPlayStore: true,
      permissions: ['INTERNET', 'CAMERA', 'MICROPHONE', 'CONTACTS'],
      dangerousPermissions: [],
      riskLevel: 'safe',
    },
    {
      id: '2',
      name: 'Banco Popular Dominicano',
      packageName: 'com.bancopopular.app',
      developer: 'Banco Popular Dominicano',
      isFromPlayStore: true,
      permissions: ['INTERNET', 'BIOMETRIC'],
      dangerousPermissions: [],
      riskLevel: 'safe',
    },
    {
      id: '3',
      name: 'Banreservas Móvil',
      packageName: 'com.banreservas.movil',
      developer: 'Banreservas',
      isFromPlayStore: true,
      permissions: ['INTERNET', 'BIOMETRIC', 'CAMERA'],
      dangerousPermissions: [],
      riskLevel: 'safe',
    },
    {
      id: '4',
      name: 'BHD León',
      packageName: 'com.bhdleon.movil',
      developer: 'Banco BHD León',
      isFromPlayStore: true,
      permissions: ['INTERNET', 'BIOMETRIC'],
      dangerousPermissions: [],
      riskLevel: 'safe',
    },
    {
      id: '5',
      name: 'Mi Claro RD',
      packageName: 'com.claro.miclaro.rd',
      developer: 'Claro RD',
      isFromPlayStore: true,
      permissions: ['INTERNET', 'PHONE_STATE'],
      dangerousPermissions: [],
      riskLevel: 'safe',
    },
    {
      id: '6',
      name: 'BancoPopular Seguro 2024',
      packageName: 'com.bancopopular.seguro.fake',
      developer: 'Developer2024RD',
      isFromPlayStore: false,
      permissions: ['INTERNET', 'READ_SMS', 'SEND_SMS', 'READ_CONTACTS'],
      dangerousPermissions: ['READ_SMS', 'SEND_SMS', 'READ_CONTACTS'],
      riskLevel: 'danger',
    },
    {
      id: '7',
      name: 'Banreservas Premium',
      packageName: 'com.banreservas.premium.fake',
      developer: 'AppsDominicanas',
      isFromPlayStore: false,
      permissions: ['INTERNET', 'READ_SMS', 'ACCESSIBILITY'],
      dangerousPermissions: ['READ_SMS', 'BIND_ACCESSIBILITY_SERVICE'],
      riskLevel: 'danger',
    },
    {
      id: '8',
      name: 'Bono Gobierno RD',
      packageName: 'com.bono.gobierno.rd',
      developer: 'GobiernoApps',
      isFromPlayStore: false,
      permissions: ['INTERNET', 'READ_SMS', 'READ_CONTACTS', 'CAMERA'],
      dangerousPermissions: ['READ_SMS', 'READ_CONTACTS'],
      riskLevel: 'danger',
    },
    {
      id: '9',
      name: 'Claro Megas Gratis',
      packageName: 'com.claro.megas.gratis',
      developer: 'PromoRD2024',
      isFromPlayStore: false,
      permissions: ['INTERNET', 'READ_SMS', 'SEND_SMS'],
      dangerousPermissions: ['READ_SMS', 'SEND_SMS'],
      riskLevel: 'danger',
    },
    {
      id: '10',
      name: 'Limpiador Memoria RD',
      packageName: 'com.memory.cleaner.rd',
      developer: 'CleanApps Inc',
      isFromPlayStore: true,
      permissions: ['INTERNET', 'READ_CONTACTS'],
      dangerousPermissions: ['READ_CONTACTS'],
      riskLevel: 'warning',
    },
    {
      id: '11',
      name: 'Teclado Español Gratis',
      packageName: 'com.teclado.espanol.gratis',
      developer: 'TecladosApp',
      isFromPlayStore: true,
      permissions: ['INTERNET', 'READ_CONTACTS', 'RECORD_AUDIO'],
      dangerousPermissions: ['READ_CONTACTS', 'RECORD_AUDIO'],
      riskLevel: 'warning',
    },
  ];

  return mockApps.map(app => {
    const calculatedRiskLevel = analyzeAppRisk(app);
    const updatedApp: ScannedApp = {
      ...app,
      riskLevel: calculatedRiskLevel,
    };
    const warningMessage =
      calculatedRiskLevel !== 'safe' ? generateWarningMessage(updatedApp, 'es') : '';
    return {
      ...updatedApp,
      warningMessage,
    };
  });
}

/**
 * Filter apps by risk level
 */
export function filterAppsByRisk(apps: ScannedApp[], riskLevel: RiskLevel): ScannedApp[] {
  return apps.filter(app => app.riskLevel === riskLevel);
}

/**
 * Get summary statistics
 */
export function getAppScanSummary(apps: ScannedApp[]) {
  return {
    total: apps.length,
    safe: apps.filter(a => a.riskLevel === 'safe').length,
    warning: apps.filter(a => a.riskLevel === 'warning').length,
    danger: apps.filter(a => a.riskLevel === 'danger').length,
  };
}

/**
 * Carga el módulo nativo de apps instaladas si existe, sin romper el bundle.
 */
function safeRequireInstalledApps(): any | null {
  try {
    // Primero intenta NativeModules (nuestro módulo nativo custom)
    if (NativeModules.InstalledAppsNative) return NativeModules.InstalledAppsNative;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('react-native-installed-apps');
  } catch (e) {
    return null;
  }
}

// ============================================
// PLACEHOLDER: Future malware heuristics
// ============================================
export async function checkMalwareHeuristics(_packageName: string): Promise<boolean> {
  // TODO: Implement real-time malware pattern detection
  // This could check against known malware signatures
  // and behavioral patterns
  console.log('[PLACEHOLDER] Malware heuristics check');
  return false;
}

