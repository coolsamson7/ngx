import { Injectable, Injector, Provider, Type } from '@angular/core';
import { ModuleMetadata } from './module.interface';
import { TraceLevel, Tracer } from '../tracer';
import { AbstractModule } from './abstract-module';

export class AbstractPackage<M extends ModuleMetadata = ModuleMetadata> extends AbstractModule() implements ModuleMetadata {
     // instance data

     public config: M

     // constructor

     constructor(injector: Injector) {
        super(injector)
        
        this.config = Reflect.get(this.constructor, "$$metadata"); // TODO double!

        injector.get(ModuleRegistry).register(this as ModuleMetadata)
     }

     // implement ModuleMetadata

     get isLoaded(): boolean {
         return this.config.isLoaded!;
     }

     get commitHash() : string {
        return this.config.commitHash!;
     }

     get name(): string {
        return this.config.name;
     }

      get type(): "shell" | "microfrontend" | "library" {
        return this.config.type!;
      }

      get version(): string {
        return this.config.version!;
      }
 }

 export interface LibraryMeta {
   provide: Type<any>;
   factory: Provider
 }

 const LIBRARY_CLASSES: LibraryMeta[] = [];

 export function registerLibrary(target: Type<any>) {
   LIBRARY_CLASSES.push({
     provide: target,
     factory: {
       provide: target,
       useFactory: (injector: Injector) => new target(injector),
       deps: [Injector],
     }
   });
 }

 export function getLibraryProviders(): Provider[] {
   return LIBRARY_CLASSES.map(lib => lib.factory);
 }


 export function createLibraries(injector: Injector) {
     LIBRARY_CLASSES.forEach(lib => injector.get(lib.provide));
 }


/**
 * A <code>ModuleRegistry</code> keeps track of - specifically decorated - modules, including their
 * <ul>
 *   <li>meta-data fetched from package.json and</li>
 *   <li>their loaded status</li>
 * </ul>
 */
@Injectable({providedIn: 'root'})
export class ModuleRegistry {
    // static

    static modules : Type<any>[]  = []

    static createModules(injector: Injector) {
        for (const module of ModuleRegistry.modules)
           injector.get(module)

        ModuleRegistry.modules = []
    }

    // instance data

    /**
     * the map of module meta-data
     */
    modules : { [name : string] : ModuleMetadata } = {}

    // constructor

    /**
     * create a new {@link ModuleRegistry}
     */
    constructor(private injector: Injector) {
        if ( Tracer.ENABLED)
            Tracer.Trace("portal", TraceLevel.FULL, "new module registry")

        ;(window as any)["modules"] = () => {
            this.report()
        }
    }

    // public

    report() {
        const snapshot = Object.values(this.modules).map(m => ({
            name: m.name,
            type: m.type,
            version: m.version,
            isLoaded: m.isLoaded
          }));

        console.table(snapshot, ["name", "type", "version", "isLoaded"])
    }

    /**
     * register module metadata
     * @param metadata meta data
     */
    register(metadata : ModuleMetadata) {
        if ( Tracer.ENABLED)
            Tracer.Trace("portal", TraceLevel.FULL, "register module {0}", metadata.name)

        // leave registered modules as is ( in case of a redeployment )

        const entry = this.modules[metadata.name]
        if (!entry)
            this.modules[metadata.name] = metadata
        else {
            // stupid timing problems
            this.modules[metadata.name] = {...metadata, ...entry}
        }
    }

    /**
     * mark the specified module as loaded
     * @param metadata the module meta-data
     */
    markAsLoaded(metadata : ModuleMetadata) {
        if ( Tracer.ENABLED)
            Tracer.Trace("portal", TraceLevel.FULL, "loaded module {0}", metadata.name)

        if (this.modules[metadata.name])
            this.modules[metadata.name].isLoaded = true
        else {
            metadata.isLoaded = true
            this.modules[metadata.name] = metadata
        }

    }
}
