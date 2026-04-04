import { Type } from "@angular/core";

export abstract class ExtensionPoint {
    abstract readonly type: Type<ExtensionPoint>;
}