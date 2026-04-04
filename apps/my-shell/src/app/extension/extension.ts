import { Type } from "@angular/core";
import { ExtensionPoint } from "./extension-point";

export abstract class AbstractExtension<EP extends ExtensionPoint = ExtensionPoint> {
    abstract readonly type: Type<EP>;

    supports(ep: EP, target: any) : ep is EP {
        return ep instanceof this.type
    }

    abstract extend(extensionPoint: EP, target: any) : void
}