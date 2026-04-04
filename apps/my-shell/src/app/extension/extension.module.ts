import { Injector, NgModule } from '@angular/core';
import { AbstractModule } from '@ngx/common';
import { SampleExtension } from './sample.extension';

@NgModule({
  imports: []
})
export class ExtensionModule extends AbstractModule() {
  constructor(injector : Injector) {
    super(injector)

    SampleExtension
  }
}
