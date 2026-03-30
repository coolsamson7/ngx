import { Injector } from "@angular/core";
import { AbstractPackage, Library } from "./modules";
import * as pkg from './package.meta';

@Library(pkg)
export class CommunicationPackage extends AbstractPackage {
    constructor(injector: Injector) { 
        super(injector)
    }
}