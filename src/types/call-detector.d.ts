declare module 'react-native' {
  interface NativeModulesStatic {
    CallDetector?: {
      startListening: () => Promise<boolean>;
      stopListening: () => Promise<void>;
      isAvailable?: () => Promise<boolean>;
    };
  }
}


