const { withModuleFederation } = require('@nx/angular/module-federation');
const config = require('./module-federation.config');

module.exports = withModuleFederation({
dts: false,
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
      '@ngx/foundation',
      '@ngx/portal',
      '@ngx/i18n',
      '@ngx/ui',
      '@ngx/component',
      '@ngx/security',
    ];

    const isSingleton = singletonLibs.some(
      (lib) => libraryName === lib || libraryName.startsWith(lib + '/')
    );

    if (!isSingleton) return sharedConfig;

    return {
      ...sharedConfig,
      singleton: true,
      strictVersion: true, // ! isInternal
      requiredVersion: false,
      eager: true//libraryName === 'reflect-metadata',
    };
  },
});