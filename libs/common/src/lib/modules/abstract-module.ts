import { ReplaySubject } from "rxjs";
import { Injector } from "@angular/core";
import { ModuleRegistry } from "./module-registry";


abstract class _AbstractModule {
    public static injectorSubject: ReplaySubject<Injector>;
}

export const AbstractModule = () =>  {
    const injectorSubject: ReplaySubject<Injector> = new ReplaySubject<Injector>(1)

    return class AbstractModuleClass extends _AbstractModule {
        static override injectorSubject = injectorSubject

        constructor(injector: Injector) {
            super();

            const metadata = Reflect.get(this.constructor, "$$metadata")
            if ( metadata )
                injector.get(ModuleRegistry).markAsLoaded(metadata)

            injectorSubject.next(injector)
        }
    }
}