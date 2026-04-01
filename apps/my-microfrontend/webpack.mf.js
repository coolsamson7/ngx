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

// Workspace libs have non-semver versions ("workspace:*"), so skip requiredVersion
const workspaceLibs = ['@ngx/common', '@ngx/portal', '@ngx/i18n', '@ngx/security'];

module.exports = withModuleFederation({
  dts: false,
  ...config,
  shared: (libraryName, sharedConfig) => {
    const isSingleton = singletonLibs.some(
      (lib) => libraryName === lib || libraryName.startsWith(lib + '/')
    );

    if (!isSingleton) return sharedConfig;

    const isWorkspace = workspaceLibs.some(
      (lib) => libraryName === lib || libraryName.startsWith(lib + '/')
    );

    return {
      ...sharedConfig,
      singleton: true,
      strictVersion: !isWorkspace,   // workspace:* is not semver, strict breaks negotiation
      requiredVersion: isWorkspace ? false : 'auto',
      eager: libraryName === 'reflect-metadata',
    };
  },
});