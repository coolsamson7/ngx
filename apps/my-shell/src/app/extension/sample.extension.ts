import { Injectable } from "@angular/core";
import { ExtensionPoint } from "./extension-point";
import { Extension } from "./extension.decorator";
import { AbstractExtension } from "./extension";


export class SampleExtensionPoint extends ExtensionPoint {
    readonly type = SampleExtensionPoint;

    menus : string[] = []

    addMenu(menu: string) : SampleExtensionPoint {
        this.menus.push(menu)

        return this
    }
}

@Extension()
@Injectable({providedIn: 'root'})
export class SampleExtension extends AbstractExtension<SampleExtensionPoint,any> {
    readonly type = SampleExtensionPoint;

    // implement

    override supports(ep: SampleExtensionPoint, target: any) : ep is SampleExtensionPoint {
        return true;
    }

    extend(extensionPoint: SampleExtensionPoint) : void {
        extensionPoint
            .addMenu("foo")
            .addMenu("bar")
    }
}