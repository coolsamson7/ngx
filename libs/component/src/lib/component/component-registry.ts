import { InjectionToken, Type } from '@angular/core';

export interface ComponentRegistry {
  [key: string]: Type<any>;
}

export const COMPONENT_REGISTRY = new InjectionToken<ComponentRegistry>('COMPONENT_REGISTRY');