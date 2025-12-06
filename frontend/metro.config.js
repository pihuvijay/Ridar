const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for TypeScript and other file extensions
config.resolver.sourceExts.push('ts', 'tsx', 'js', 'jsx', 'json', 'cjs');

// Add support for absolute imports
config.resolver.extraNodeModules = new Proxy(
  {},
  {
    get: (target, name) => {
      return path.join(process.cwd(), `node_modules/${name}`);
    },
  }
);

// Add support for symlinks
config.resolver.extraNodeModules = new Proxy(
  {},
  {
    get: (target, name) => {
      return path.join(process.cwd(), `node_modules/${name}`);
    },
  }
);

// Enable hot reloading
config.transformer.minifierConfig = {
  keep_classnames: true,
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;
