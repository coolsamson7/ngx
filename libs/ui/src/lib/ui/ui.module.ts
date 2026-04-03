import { ModuleWithProviders, NgModule, Type, InjectionToken, Provider } from '@angular/core';

import { UIHandler } from './ui-handler';
import { UIExecutor } from './ui-executor';
import { UI_HANDLER_TYPES } from './ui.tokens';

  export function provideUIHandlers(
    handlers: Type<UIHandler<any>>[]
  ): Provider[] {
    return [
      ...handlers,
      {
        provide: UI_HANDLER_TYPES,
        useValue: handlers,
        multi: true
      }
    ];
  }
  
@NgModule({})
export class UIModule {
  static forRoot(
    handlers: Type<UIHandler<any>>[]
  ): ModuleWithProviders<UIModule> {
    return {
      ngModule: UIModule,
      providers: [
        UIExecutor,
        provideUIHandlers(handlers)
      ]
    };
  }
}