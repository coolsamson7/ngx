import { APP_INITIALIZER, Injector, NgModule, DoBootstrap, Injectable } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import {LIBRARY_METADATA} from './package-meta';

import { completeIconSet } from './icons/generated/my-icons';

import { localRoutes } from './local.routes';

import { AbstractCommandInterceptor, CommandErrorInterceptor, CommandModule, ExecutionContext } from "@ngx/foundation"

import { ComponentModule, MaterialButtonComponent, MaterialCommandToolbarComponent } from "@ngx/component";

import {
  CanActivateGuard,
  CanDeactivateGuard,

  PortalModule,

  Shell,

  Manifest,
} from '@ngx/portal';

import * as common from '@ngx/common';

import {
  SecurityModule,

} from '@ngx/security';

import {
  AssetTranslationLoader,
  I18nModule,
  I18nResolver,
  LocaleModule,
} from '@ngx/i18n';

import {
  IconRegistry,
  MaterialUIModule,
} from '@ngx/ui';

import { Route } from '@angular/router';

import * as localManifest from '../assets/manifest.json';
import { environment } from '../environments/environment';
import { SampleAuthentication } from './security/sample-authentication';
import { SampleAuthorization } from './security/sample-authorization';
import { ShellRouterModule } from './shell-router.module';
import { ExtensionModule } from './extension';
import { ErrorModule } from '@ngx/common';

@Injectable({ providedIn: 'root' })
export class TraceCommandInterceptor extends AbstractCommandInterceptor {
  // implement CommandInterceptor

  /**
   * @inheritdoc
   */
  override onCall(executionContext: ExecutionContext): void {
    console.log("> " + executionContext.command.name)
  }

  /**
   * @inheritdoc
   */
  override onResult(executionContext: ExecutionContext): void {
     console.log("< " + executionContext.command.name)
  }

  /**
   * @inheritdoc
   */
  override onError(executionContext: ExecutionContext): void {
     console.log("x " + executionContext.command.name)
  }
}

@Injectable({ providedIn: 'root' })
export class ApplicationErrorHandler {
  // constructor

  constructor() {
  }

  // handler

  @common.ErrorHandler()
  handleAnyError(e: any, context: common.ErrorContext) {
    console.log(e)
  }
}

@Shell(LIBRARY_METADATA)
@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    ShellRouterModule,

    ExtensionModule,

    // handleAnyError

    ErrorModule.forRoot({
        handler: [
          ApplicationErrorHandler
        ]
    }),

    // configuration

    common.ConfigurationModule.forRoot(new common.ValueConfigurationSource(environment)),

    // authentication & authorization

    SecurityModule.forRoot({
      authentication: SampleAuthentication,
      authorization: SampleAuthorization,
    }),

    // tracing

    common.TracerModule.forRoot({
      enabled: !environment.production,
      trace: new common.ConsoleTrace('%d [%p]: %m %f\n'), // d(ate), l(evel), p(ath), m(message), f(rame)
      paths: {
        feature: common.TraceLevel.FULL,
        portal: common.TraceLevel.FULL,
      },
    }),

    // manages the current locale

    LocaleModule.forRoot({
      locale: 'en-US',
      supportedLocales: ['en-US', 'de-DE'],
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
        interceptors: [
          TraceCommandInterceptor,
          CommandErrorInterceptor
        ]
    }),

    // components

    ComponentModule.forRoot({
      button: {
          type: MaterialButtonComponent,
          options: {
              appearance: "icon",
              color: "primary"
          }
      },
      "command-toolbar": {
          type: MaterialCommandToolbarComponent,
          options: {}
      }
    }),

    // ui

    MaterialUIModule,

    // portal

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
       {
        provide: APP_INITIALIZER,
        useFactory: (registry: IconRegistry) => () => registry.registerAll(Object.fromEntries(completeIconSet.map(icon => [icon.name, icon]))),
        deps: [IconRegistry],
        multi: true,
      },

    ...common.getLibraryProviders(),
    {
      provide: APP_INITIALIZER,
      useFactory: (injector: Injector) => () => {
        common.createLibraries(injector)

        injector.get(common.ModuleRegistry).report()
      },
      deps: [Injector],
      multi: true,
    },
  ],

})
export class ShellModule extends common.AbstractPackage implements DoBootstrap {
  constructor(injector: Injector) {
    super(injector);

    injector.get(common.ModuleRegistry).report()
  }

  ngDoBootstrap() {
      /* empty */
   }
}
