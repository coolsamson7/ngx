import { Injectable, Type } from '@angular/core';

import { AbstractExtension } from './extension';
import { ExtensionPoint } from './extension-point';

/**
 * The <code>ExtensionRegistry</code> is the registry for known extensions
 */
@Injectable({providedIn: 'root'})
export class ExtensionRegistry {
    // instance data

    private registry = new Map<Type<ExtensionPoint>, AbstractExtension[]>();

    // private

    private findExtensions(ep: ExtensionPoint) : AbstractExtension[] {
        const results: AbstractExtension[] = [];
    
        let type = ep.type as Type<ExtensionPoint> | null;
        while (type && type !== ExtensionPoint) {
            const extensions = this.registry.get(type);
            if (extensions) results.push(...extensions);
            
            type = Object.getPrototypeOf(type) as Type<ExtensionPoint> | null;
        }
        
        return results.reverse();
    }

    // public

    /**
     * register a specific extension
     * @param type the formatter name
     * @param formatter the formatter
     */
    register<EP extends ExtensionPoint>(extension : AbstractExtension<EP>) {
        const extensions = this.registry.get(extension.type);
         if (extensions)
            extensions.push(extension)
         else
            this.registry.set(extension.type, [extension]);
    }

    extend(ep: ExtensionPoint, target: any) {
        for (const extension of this.findExtensions(ep))
           if (extension.supports(ep, target))
            extension.extend(ep, target)
    }
}
