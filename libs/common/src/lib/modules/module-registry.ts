import { Injectable, Injector, Provider, Type } from '@angular/core';
import { ModuleMetadata } from './module-metadata.interface';
import { TraceLevel, Tracer } from '../tracer';

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
       deps: [Injector, ModuleRegistry],
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

        console.log("########### MR")
        console.log(new Error().stack);

        ;(window as any)["modules"] = () => {
            this.report()
        }
    }

    // public

    report() {
        console.table(Object.values(this.modules), ["name", "type", "version", "isLoaded"])
    }

    /**
     * register module metadata
     * @param metadata meta data
     */
    register(metadata : ModuleMetadata) {
        if ( Tracer.ENABLED)
            Tracer.Trace("portal", TraceLevel.FULL, "register {0} {1}", metadata.type, metadata.name)

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
