const { withModuleFederation } = require('@nx/angular/module-federation');
const config = require('./module-federation.config');

const singletonLibs = [
    // Angular core
    '@angular/core',
    '@angular/common',
    '@angular/common/http',
    '@angular/router',
    '@angular/forms',
    '@angular/platform-browser',
    '@angular/platform-browser/animations',
    '@angular/animations',

    // Angular Material + CDK

    '@angular/material',
    '@angular/cdk',

    // RxJS

    'rxjs',
    'rxjs/operators',

    // your libs
    '@ngx/common',
    '@ngx/portal',
    '@ngx/i18n',
    '@ngx/security',
];

module.exports = withModuleFederation({
    ...config,
    shared: (libraryName, sharedConfig) => {
        const isSingleton = singletonLibs.some(lib =>
            libraryName === lib || libraryName.startsWith(lib + '/')
        );

        if (isSingleton) {
            return {
                ...sharedConfig,
                singleton: true,
                strictVersion: false,  // warn but don't crash on version mismatch
                eager: false,          // lazy load — let the shell provide it
            };
        }

        // pure utility libs (lodash, date-fns, etc.) — no singleton needed
        return sharedConfig;
    },
});