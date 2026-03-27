const { withModuleFederation } = require('@nx/angular/module-federation');
const config = require('./module-federation.config');

module.exports = withModuleFederation({
  ...config,
  shared: (libraryName, sharedConfig) => {
    // Shared libraries should usually be singletons
    if (libraryName.startsWith('@angular/')) {
      return { ...sharedConfig, singleton: true, strictVersion: true, eager: false };
    }
    return sharedConfig;
  },
});