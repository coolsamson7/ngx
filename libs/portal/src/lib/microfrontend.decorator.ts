import { AbstractPackage, ConstructorFunction, TypeDescriptor } from "@ngx/common";
import { ModuleMetadata } from "./modules";

/**
 * @ignore
 */
export type MicrofrontendMetadata = ModuleMetadata & {
    type? : 'microfrontend';
};

export function Microfrontend(config: Partial<ModuleMetadata> = {}): any {
     config.type = "shell"
     config.isLoaded = true

     return function create<T extends ConstructorFunction<AbstractPackage<ModuleMetadata>>>(constructor: T): any {
         TypeDescriptor.forType(constructor).addTypeDecorator(Microfrontend)

         Reflect.set(constructor, "$$metadata", config);
     }
 }
