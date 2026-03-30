import { Injector } from "@angular/core";
import { AbstractPackage, Library } from "./modules";
import * as pkg from '../../package.json';

@Library(pkg)
export class CommonPackage extends AbstractPackage {
    constructor(injector: Injector) { 
        super(injector)
    }
}