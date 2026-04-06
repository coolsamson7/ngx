import { Component, Injector } from "@angular/core";
import { Feature } from "@ngx/portal";
import { AbstractPreferencesPage } from "../preferences-feature";
import { MatTableModule } from "@angular/material/table";
import { ModuleMetadata, ModuleRegistry } from "@ngx/common";


@Feature({
  id: 'sample-preferences',
  tags: ["preferences"]
})
@Component({
  standalone: true,
  selector: 'preferences-page-1',
  templateUrl: './sample-preference.html',
   imports: [MatTableModule]
})
export class SamplePreferencesComponent extends AbstractPreferencesPage {
   // instance data

  dataSource : ModuleMetadata[] = []
  displayedColumns : string[] = ['name', 'type', 'version', 'isLoaded'];

  // constructor

  constructor(injector: Injector, public moduleRegistry : ModuleRegistry) {
      super(injector);

      this.dataSource = Object.values(moduleRegistry.modules)
  }
}

