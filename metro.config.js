const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add wasm files to asset extensions so Metro can resolve them on web
config.resolver.assetExts.push('wasm');

module.exports = config;
