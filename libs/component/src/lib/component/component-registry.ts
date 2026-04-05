import { InjectionToken, Type } from '@angular/core';

export interface ComponentConfig<T = any> {
  type: Type<T>;
  options?: Record<string, any>;
}

export interface ComponentRegistry {
  [key: string]: Type<any> | ComponentConfig;
}

export const COMPONENT_REGISTRY = new InjectionToken<ComponentRegistry>('COMPONENT_REGISTRY');