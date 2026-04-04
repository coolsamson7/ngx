import { ExtensionRegistry } from './extension-registry';
import { ExtensionModule } from "./extension.module";

/**
 * register the formatter under the given name.
 * @param type the name
 * @constructor
 */
export const Extension = () : ClassDecorator => {
    return (type : any) => {
        import('./extension.module').then((m) => {
            m.ExtensionModule.injectorSubject.subscribe((injector) => {
                const registry = injector.get(ExtensionRegistry);

                registry.register(injector.get(type));
            });
        })
    }
}
