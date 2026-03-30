import { ModuleMetadata } from './module.interface';
import { TypeDescriptor } from '../reflection';
import { ConstructorFunction } from '../lang';
import { Injectable } from '@angular/core';
import { AbstractPackage } from './abstract-package';
import { registerLibrary } from './module-registry';

 export function Library(config: Partial<ModuleMetadata> = {}): any {
     config.type = "library"
     config.isLoaded = true

     return function create<T extends ConstructorFunction<AbstractPackage<ModuleMetadata>>>(constructor: T): any {
         TypeDescriptor.forType(constructor).addTypeDecorator(Library)

         registerLibrary(constructor);

         Injectable({providedIn: "root"})(constructor);

         Reflect.set(constructor, "$$metadata", config);
     }
 }

