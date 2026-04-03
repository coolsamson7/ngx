import { APP_INITIALIZER, Injector, NgModule, DoBootstrap } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import {LIBRARY_METADATA} from './package-meta';

import { ShellComponent } from './shell.component';
import { localRoutes } from './local.routes';

import { CommandModule } from "@ngx/foundation"

import {
  CanActivateGuard,
  CanDeactivateGuard,

  PortalModule,
  
  //ServerTranslationLoader,
  Shell,

  Manifest,
} from '@ngx/portal';

import {
  AbstractModule,
 

  ConsoleTrace,

  TraceLevel,
  TracerModule,
  ConfigurationModule,
  ValueConfigurationSource,
  getLibraryProviders,
  createLibraries,
  ModuleRegistry,
  AbstractPackage,
} from '@ngx/common';

import {
  SecurityModule,

} from '@ngx/security';

import {
  AssetTranslationLoader,
  I18nModule,
  I18nResolver,
  LocaleModule,
} from '@ngx/i18n';

import { Route } from '@angular/router';

import * as localManifest from '../assets/manifest.json';
import { environment } from '../environments/environment';
import { SampleAuthentication } from './security/sample-authentication';
import { SampleAuthorization } from './security/sample-authorization';
import { ShellRouterModule } from './shell-router.module';


@Shell(LIBRARY_METADATA)
@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    ShellRouterModule,

    // configuration

    ConfigurationModule.forRoot(new ValueConfigurationSource(environment)),

    // authentication & authorization

    SecurityModule.forRoot({
      authentication: SampleAuthentication,
      authorization: SampleAuthorization,
    }),

    // tracing

    TracerModule.forRoot({
      enabled: !environment.production,
      trace: new ConsoleTrace('%d [%p]: %m %f\n'), // d(ate), l(evel), p(ath), m(message), f(rame)
      paths: {
        feature: TraceLevel.FULL,
        portal: TraceLevel.FULL,
      },
    }),

    // manages the current locale

    LocaleModule.forRoot({
      locale: 'en',
      supportedLocales: ['en', 'de'],
    }),

    // localization

    I18nModule.forRoot({
      loader: { 
        type: AssetTranslationLoader,
        path: 'assets/i18n/'
      },
    }),

    // commands

    CommandModule.forRoot({
        interceptors: []
    }),

    // the main microfrontend logic

    PortalModule.forRoot({
      loader: {
        //server: {},
        local: { 
          remotes: [
            "http://localhost:4201",
          ]
        }
      },
      localRoutes: localRoutes,
      localManifest: localManifest as any as Manifest,
      decorateRoutes: (route: Route) => {
        route.resolve = { i18n: I18nResolver };
        route.canActivate = [CanActivateGuard];
        route.canDeactivate = [CanDeactivateGuard];
      },
    }),
  ],
  providers: [
    ...getLibraryProviders(),
    {
      provide: APP_INITIALIZER,
      useFactory: (injector: Injector) => () => {
        createLibraries(injector)

        injector.get(ModuleRegistry).report()
      },
      deps: [Injector],
      multi: true,
    },
  ],
  //bootstrap: [ShellComponent],
})
export class ShellModule extends AbstractPackage implements DoBootstrap {
  constructor(injector: Injector) {
    super(injector);

    injector.get(ModuleRegistry).report()
  }

  ngDoBootstrap() {
      /* empty */
   }
}
