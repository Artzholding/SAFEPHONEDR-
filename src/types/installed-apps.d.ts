declare module 'react-native-installed-apps' {
  type InstalledApp = {
    appName: string;
    packageName: string;
    versionName?: string;
    versionCode?: number;
    firstInstallTime?: number;
    lastUpdateTime?: number;
    systemApp?: boolean;
  };

  const InstalledApps: {
    getApps(includeSystemApps?: boolean): Promise<InstalledApp[]>;
    getNonSystemApps(): Promise<InstalledApp[]>;
  };

  export default InstalledApps;
}

