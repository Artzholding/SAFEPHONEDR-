import { useEffect, useState, useRef, useCallback } from 'react';
import { NativeEventEmitter, NativeModules, PermissionsAndroid, Platform } from 'react-native';
import Constants from 'expo-constants';
import { getReportForPhone, ReportedPhone, syncReportedPhones } from '../utils/reportedIndicators';

const { CallDetector } = NativeModules as { CallDetector?: { startListening: () => Promise<boolean>; stopListening: () => Promise<void>; isAvailable?: () => Promise<boolean>; } };

type IncomingState = {
  number: string | null;
  report: ReportedPhone | null;
  isReported: boolean;
};

export function useCallDetection() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [incoming, setIncoming] = useState<IncomingState>({ number: null, report: null, isReported: false });
  const emitterRef = useRef<NativeEventEmitter | null>(null);

  const requestPermission = useCallback(async () => {
    if (Platform.OS !== 'android') return false;
    try {
      const perms = [
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
        PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS,
      ].filter(Boolean) as PermissionsAndroid.Permission[];

      const result = await PermissionsAndroid.requestMultiple(perms);
      const granted = Object.values(result).every((v) => v === PermissionsAndroid.RESULTS.GRANTED);
      setPermissionGranted(granted);
      return granted;
    } catch {
      setPermissionGranted(false);
      return false;
    }
  }, []);

  const start = useCallback(async () => {
    if (!CallDetector || Platform.OS !== 'android') return;
    const granted = permissionGranted || (await requestPermission());
    if (!granted) return;
    try {
      await CallDetector.startListening();
    } catch {
      // ignore
    }
  }, [permissionGranted, requestPermission]);

  useEffect(() => {
    if (!CallDetector || Platform.OS !== 'android') return;
    emitterRef.current = new NativeEventEmitter(CallDetector);
    const sub = emitterRef.current.addListener('CallDetector:onStateChange', async (event) => {
      const rawNumber = event?.number as string | undefined;
      if (!rawNumber) return;
      const report = await getReportForPhone(rawNumber);
      setIncoming({
        number: rawNumber,
        report,
        isReported: !!report,
      });
    });
    return () => {
      sub.remove();
      emitterRef.current?.removeAllListeners?.('CallDetector:onStateChange');
      CallDetector?.stopListening?.();
    };
  }, []);

  // Best-effort sync on mount if endpoint provided
  useEffect(() => {
    const endpoint = (Constants.expoConfig?.extra as any)?.APP_REPORTS_ENDPOINT || process.env.APP_REPORTS_ENDPOINT;
    if (!endpoint) return;
    syncReportedPhones(endpoint).catch(() => {});
  }, []);

  return {
    incoming,
    permissionGranted,
    requestPermission,
    start,
  };
}


