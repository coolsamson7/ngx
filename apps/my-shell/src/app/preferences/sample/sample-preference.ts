import { Component, Injector } from "@angular/core";
import { Feature } from "@ngx/portal";
import { AbstractPreferencesPage } from "../preferences-feature";


@Feature({
  id: 'preferences-1',
  tags: ["preferences"]
})
@Component({
  standalone: true,
  selector: 'preferences-page-1',
  templateUrl: './sample-preference.html',
})
export class SamplePreferencesComponent extends AbstractPreferencesPage {
  // constructor

  constructor(injector: Injector) {
    super(injector);
  }

}

