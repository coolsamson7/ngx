import { AbstractPackage, ConstructorFunction, TypeDescriptor } from "@ngx/common";
import { ModuleMetadata } from "./modules";

/**
 * meta data for libraries
 */
export type ShellMetadata = ModuleMetadata & {
    type? : 'shell';
};

 export function Shell(config: Partial<ModuleMetadata> = {}): any {
     config.type = "shell"
     config.isLoaded = true

     return function create<T extends ConstructorFunction<AbstractPackage<ModuleMetadata>>>(constructor: T): any {
         TypeDescriptor.forType(constructor).addTypeDecorator(Shell)

         Reflect.set(constructor, "$$metadata", config);
     }
 }