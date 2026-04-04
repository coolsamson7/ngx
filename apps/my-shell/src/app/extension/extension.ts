import { Type } from "@angular/core";
import { ExtensionPoint } from "./extension-point";

export abstract class AbstractExtension<EP extends ExtensionPoint = ExtensionPoint, T = any> {
    abstract readonly type: Type<EP>;

    supports(ep: EP, target: T) : ep is EP {
        return true// ep instanceof this.type
    }

    abstract extend(extensionPoint: EP, target: any) : void
}