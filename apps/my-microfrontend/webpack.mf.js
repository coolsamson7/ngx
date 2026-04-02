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
   const isSingleton = singletonLibs.some(
       (lib) => libraryName === lib || libraryName.startsWith(lib + '/')
     );

     if (!isSingleton) return sharedConfig;

     // Empty config = webpack found source files, not package.json
     // Tell MFE: consume from shell's shared scope, don't provide your own copy
     if (Object.keys(sharedConfig).length === 0) {
       return {
         singleton: true,
         strictVersion: false,
         requiredVersion: false,
         import: false,  // consume only, don't bundle
       };
     }

     return {
       ...sharedConfig,
       singleton: true,
       strictVersion: false,
       requiredVersion: 'auto',
       eager: libraryName === 'reflect-metadata',
     };
   }
}).then(cfg => {
    // Override tsconfig paths — force webpack to resolve @ngx/*
    // through node_modules symlinks (pnpm workspace links)
    cfg.resolve = cfg.resolve || {};
    cfg.resolve.alias = {
      ...cfg.resolve.alias,
      '@ngx/portal': path.resolve(__dirname, '../../node_modules/@ngx/portal'),
      '@ngx/common': path.resolve(__dirname, '../../node_modules/@ngx/common'),
      '@ngx/i18n': path.resolve(__dirname, '../../node_modules/@ngx/i18n'),
      '@ngx/security': path.resolve(__dirname, '../../node_modules/@ngx/security'),
      '@ngx/communication': path.resolve(__dirname, '../../node_modules/@ngx/communication'),
    };
    return cfg;
  });