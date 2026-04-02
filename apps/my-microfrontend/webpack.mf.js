const { withModuleFederation } = require('@nx/angular/module-federation');
const config = require('./module-federation.config');
const path = require('path');

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

// Workspace libs have non-semver versions ("workspace:*"), so skip requiredVersion
const workspaceLibs = ['@ngx/common', '@ngx/portal', '@ngx/i18n', '@ngx/security'];

module.exports = withModuleFederation({
  dts: false,
  ...config,
  shared: (libraryName, sharedConfig) => {
    if (!libraryName) return sharedConfig;

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
      strictVersion: false,
      requiredVersion: 'auto',
      eager: libraryName === 'reflect-metadata',
    };
  },
});