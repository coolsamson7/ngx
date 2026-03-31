const { withModuleFederation } = require('@nx/angular/module-federation');
const config = require('./module-federation.config');

const singletonLibs = [
  'reflect-metadata',

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

module.exports = withModuleFederation({
  ...config,
  shared: (libraryName, sharedConfig) => {
    const isSingleton = singletonLibs.some(
      (lib) => libraryName === lib || libraryName.startsWith(lib + '/')
    );

    return {
      ...sharedConfig,
      singleton: isSingleton,
      strictVersion: false,
      eager: libraryName === 'reflect-metadata',
    };
  },
});