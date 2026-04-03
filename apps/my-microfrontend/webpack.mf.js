const { withModuleFederation } = require('@nx/angular/module-federation');
const config = require('./module-federation.config');

const mfCOnfig = withModuleFederation({
  ...config,
  shared: (libraryName, sharedConfig) => {
    const singletonLibs = [
      'reflect-metadata',
      'source-map-js',
      'tslib',

      '@angular/core',
      '@angular/common',
      '@angular/common/http',
      '@angular/router',
      '@angular/forms',
      '@angular/platform-browser',
      '@angular/platform-browser/animations',
      '@angular/animations',
      '@angular/material',
      '@angular/cdk',

      'rxjs',
      'rxjs/operators',

      '@ngx/common',
      '@ngx/portal',
      '@ngx/i18n',
      '@ngx/security',
    ];

    const isSingleton = singletonLibs.some(
      (lib) => libraryName === lib || libraryName.startsWith(lib + '/')
    );

    if (!isSingleton) return sharedConfig;

     if (Object.keys(sharedConfig).length === 0) {
        return {
          singleton: true,
          strictVersion: false,
          requiredVersion: false,
          import: false,
        };
      }

    return {
      ...sharedConfig,
      singleton: true,
      strictVersion: true,
      requiredVersion: false,
      eager: false//libraryName === 'reflect-metadata',
    };
  },
});

if (typeof mfCOnfig === 'object' && mfCOnfig.devServer) {
  mfCOnfig.devServer.client = false;
  mfCOnfig.devServer.liveReload = false;
  mfCOnfig.devServer.hot = false;
}

module.exports = mfCOnfig