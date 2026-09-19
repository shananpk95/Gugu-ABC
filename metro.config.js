const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = withNativewind(getDefaultConfig(__dirname));

const patchedUseLinking = path.resolve(__dirname, 'src/vendor/expo-router-useLinking.native.js');
const previousResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolved = previousResolveRequest
    ? previousResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);

  if (
    platform !== 'web' &&
    resolved?.type === 'sourceFile' &&
    typeof resolved.filePath === 'string' &&
    resolved.filePath.replace(/\\/g, '/').endsWith('expo-router/build/fork/useLinking.native.js')
  ) {
    return { type: 'sourceFile', filePath: patchedUseLinking };
  }

  return resolved;
};

module.exports = config;
