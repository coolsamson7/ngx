import { Injector } from "@angular/core";
import { AbstractPackage, Library } from "./modules";
import { LIBRARY_METADATA } from './package-meta';

@Library(LIBRARY_METADATA)
export class CommonPackage extends AbstractPackage {
    constructor(injector: Injector) { 
        super(injector)
    }
}