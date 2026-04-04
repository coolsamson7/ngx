import { NgModule, ModuleWithProviders } from '@angular/core';
import { COMPONENT_REGISTRY, ComponentRegistry } from './component-registry';

@NgModule()
export class ComponentModule {
  static forRoot(config: ComponentRegistry): ModuleWithProviders<ComponentModule> {
    return {
      ngModule: ComponentModule,
      providers: [
        { provide: COMPONENT_REGISTRY, useValue: config }
      ]
    };
  }
}