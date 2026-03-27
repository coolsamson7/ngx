import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ShellComponent } from './shell.component';
import { localRoutes } from './local.routes';

import {
  CanActivateGuard,
  CanDeactivateGuard,

  PortalModule,
  //PortalComponentsModule,
  
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


@Shell({
  name: 'my-shell',
})
@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    ShellRouterModule,

    ShellComponent,

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
      locale: 'en-US',
      supportedLocales: ['en-US', 'de-DE'],
    }),

    // localization

    I18nModule.forRoot({
      loader: { type: AssetTranslationLoader },
    }),

    // portal components

    //PortalComponentsModule,

    // the main microfrontend logic

    PortalModule.forRoot({
      loader: {
        //server: {},
        local: { 
          remotes: [
            //"http://localhost:4201", "http://localhost:4202"
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
    /*{
      provide: EndpointLocator,
      useClass: ApplicationEndpointLocator,
    },*/
  ],
  bootstrap: [], // 
})
export class ShellModule extends AbstractModule() {
  constructor(injector: Injector) {
    super(injector);
  }

  ngDoBootstrap() {}
}
