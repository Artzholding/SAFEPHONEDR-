import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'safephone-dr',
  extra: {
    ...config.extra,
    eas: config.extra?.eas ?? { projectId: '62b2bdc0-5654-454b-8267-74b873159dc0' },
    APP_REPORTS_ENDPOINT: process.env.APP_REPORTS_ENDPOINT || '',
  },
});

