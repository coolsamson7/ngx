import { ModuleMetadata } from './module.interface';
import { TypeDescriptor } from '../reflection';
import { ConstructorFunction } from '../lang';
import { AbstractPackage, registerLibrary } from './module-registry';
import { Injectable } from '@angular/core';

 export function Library(config: Partial<ModuleMetadata> = {}): any {
     config.type = "library"

     return function create<T extends ConstructorFunction<AbstractPackage<ModuleMetadata>>>(constructor: T): any {
         TypeDescriptor.forType(constructor).addTypeDecorator(Library)

         //ModuleRegistry.modules.push(constructor)

         registerLibrary(constructor);

         Injectable({providedIn: "root"})(constructor);

         Reflect.set(constructor, "$$metadata", config);
     }
 }

