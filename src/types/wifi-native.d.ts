declare module 'react-native-wifi-info-native' {
  export type NativeWifiInfo = {
    ssid: string;
    bssid?: string;
    isConnected: boolean;
    encryptionType: string; // "WPA3" | "WPA2" | "WPA" | "WEP" | "OPEN" | "UNKNOWN"
  };

  export function getCurrentWifiInfo(): Promise<NativeWifiInfo | null>;
}

