import { InjectionToken, Type } from '@angular/core';
import { UIHandler } from './ui-handler';

export const UI_HANDLER_TYPES = new InjectionToken<Type<UIHandler<any>>[]>('UI_HANDLER_TYPES');