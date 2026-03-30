import { Injector } from "@angular/core";
import { AbstractPackage, Library } from "@ngx/common";
import * as pkg from '../../package.json';

@Library(pkg)
export class SecurityPackage extends AbstractPackage {
    constructor(injector: Injector) {
        super(injector)
    }
}