const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const { resolver } = config;

// Advanced Resolution for crypto-js and modern libraries
config.resolver.sourceExts = [...resolver.sourceExts, 'cjs', 'mjs'];
config.resolver.resolverMainFields = ['sbmemo', 'react-native', 'browser', 'main'];

// Force Metro to find crypto-js correctly
config.resolver.extraNodeModules = {
    'crypto-js': path.resolve(__dirname, 'node_modules/crypto-js'),
};

module.exports = config;

