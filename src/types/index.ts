/**
 * SafePhone DR - Type Definitions
 * All data stays local on the device for user privacy.
 */

// Supported languages
export type Language = 'es' | 'en';

// Risk severity levels
export type RiskLevel = 'safe' | 'warning' | 'danger';

// Represents an installed app with security analysis
export interface ScannedApp {
  id: string;
  name: string;
  packageName: string;
  developer: string;
  isFromPlayStore: boolean;
  permissions: string[];
  dangerousPermissions: string[];
  riskLevel: RiskLevel;
  warningMessage?: string;
  systemApp?: boolean;
  firstInstallTime?: number;
  lastUpdateTime?: number;
  installerPackage?: string;
}

// WiFi network security info
export interface WifiSecurityInfo {
  ssid: string;
  isConnected: boolean;
  isSecure: boolean;
  encryptionType: 'WPA3' | 'WPA2' | 'WPA' | 'WEP' | 'OPEN' | 'UNKNOWN';
  hasHttpsDns: boolean;
  riskLevel: RiskLevel;
  warnings: string[];
}

// URL analysis result for phishing detection
export interface UrlAnalysisResult {
  url: string;
  isHttps: boolean;
  isSuspicious: boolean;
  isTyposquatting: boolean;
  matchedPattern?: string;
  riskLevel: RiskLevel;
  warningMessage?: string;
}

// Security tip for the dashboard
export interface SecurityTip {
  id: string;
  icon: string;
  titleEs: string;
  titleEn: string;
  descriptionEs: string;
  descriptionEn: string;
}

// Overall device security score
export interface SecurityScore {
  overallScore: number; // 0-100
  appsScore: number;
  wifiScore: number;
  lastScanDate: Date | null;
  riskyAppsCount: number;
  isWifiSafe: boolean;
}

// Navigation param types
export type RootStackParamList = {
  MainTabs: undefined;
  SecureBrowser: { initialUrl?: string };
  PhishingWarning: { url: string; reason: string };
};

export type MainTabParamList = {
  Home: undefined;
  WifiSafety: undefined;
  Browser: undefined;
  Settings: undefined;
};

