const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Disable node externals to avoid node:sea path issue on Windows
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Skip node: protocol modules that cause Windows path issues
  if (moduleName.startsWith('node:')) {
    return {
      type: 'empty',
    };
  }
  // Use default resolution for everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

