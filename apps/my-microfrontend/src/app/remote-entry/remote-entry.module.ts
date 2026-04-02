import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemoteEntryComponent } from './remote-entry.component';
import { Microfrontend } from '@ngx/portal';
import { AbstractPackage } from '@ngx/common';
import { RemoteEntryRouterModule } from './remote-entry-router.module';

import {LIBRARY_METADATA} from './package-meta';

@Microfrontend(LIBRARY_METADATA)
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
