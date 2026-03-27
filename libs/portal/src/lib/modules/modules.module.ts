import { Injector, NgModule } from '@angular/core';
import { AbstractModule } from '@ngx/common';

/**
 * the modules module
 */
@NgModule({
    imports: [],
    providers: []
})
export class ModulesModule extends AbstractModule() {
    constructor(injector: Injector) {
        super(injector);
    }
}
