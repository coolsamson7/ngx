import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemoteEntryComponent } from './remote-entry.component';
import { Microfrontend } from '@ngx/portal';
import { AbstractPackage } from '@ngx/common';
import { RemoteEntryRouterModule } from './remote-entry-router.module';

//import * as pkg from '../../../package.json';

@Microfrontend({name: "mfe"})
@NgModule({
  declarations: [],
  imports: [CommonModule, RemoteEntryRouterModule, RemoteEntryComponent],
  providers: [],
})
export class RemoteEntryModule extends AbstractPackage {
  constructor(injector: Injector) {
    super(injector);
  }
}
