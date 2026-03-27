import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemoteEntryComponent } from './remote-entry.component';
import { Microfrontend } from '@ngx/portal';
import { AbstractModule } from '@ngx/common';
import { RemoteEntryRouterModule } from './remote-entry-router.module';

@Microfrontend({ name: 'my-microfrontend' })
@NgModule({
  declarations: [],
  imports: [CommonModule, RemoteEntryRouterModule, RemoteEntryComponent],
  providers: [],
})
export class RemoteEntryModule extends AbstractModule() {
  constructor(injector: Injector) {
    super(injector);
  }
}
