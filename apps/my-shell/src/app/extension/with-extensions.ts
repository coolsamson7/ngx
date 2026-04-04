import { GConstructor, registerMixins } from "@ngx/common";
import { inject } from "@angular/core";
import { ExtensionPoint } from "./extension-point";
import { AbstractFeature } from "@ngx/portal";
import { ExtensionRegistry } from "./extension-registry";

export interface ExtensionsAPI {
  addExtensionPoint<EP extends ExtensionPoint>(extensionPoint: EP) : EP

  extend() : void
}

export function WithExtensions<T extends GConstructor<AbstractFeature>>(base: T) :GConstructor<ExtensionsAPI> &  T  {
    return registerMixins(class WithDialogsClass extends base implements ExtensionsAPI {
        // instance data

        private registry : ExtensionRegistry
        private extensionPoints :ExtensionPoint[] = []

        // constructor

        constructor(...args: any[]) {
            super(...args);

            this.registry = inject(ExtensionRegistry)
        }

        // implement ExtensionsAPI

        addExtensionPoint<EP extends ExtensionPoint>(extensionPoint: EP) {
            this.extensionPoints.push(extensionPoint);

            return extensionPoint
        }

        extend() {
            for ( const extensionPoint of this.extensionPoints) {
                this.registry.extend(extensionPoint, this)
            }
        }
    }, WithExtensions)
}