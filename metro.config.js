const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

const nativeWindConfig = withNativeWind(config, { input: './global.css', inlineRem: 16 });

// sql extension for drizzle
nativeWindConfig.resolver.sourceExts.push('sql');

module.exports = nativeWindConfig;
