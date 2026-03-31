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

function shared(libraryName, sharedConfig) {
  if (libraryName === 'reflect-metadata') {
    return { ...sharedConfig, singleton: true, strictVersion: false, eager: true };
  }

  const isSingleton = singletonLibs.some(
    (lib) => libraryName === lib || libraryName.startsWith(lib + '/')
  );

  return isSingleton
    ? { ...sharedConfig, singleton: true, strictVersion: false, eager: false }
    : sharedConfig;
}

module.exports = withModuleFederation({ ...config, shared });