import { Injector } from "@angular/core";
import { AbstractPackage, Library } from "@ngx/common";
import { LIBRARY_METADATA } from './package-meta';

@Library(LIBRARY_METADATA)
export class FoundationPackage extends AbstractPackage {
    constructor(injector: Injector) {
        super(injector)
    }
}