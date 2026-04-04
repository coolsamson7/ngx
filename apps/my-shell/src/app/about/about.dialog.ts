import { Component, Injector } from "@angular/core";
import { ModuleMetadata, ModuleRegistry } from "@ngx/common";
import { Command, WithCommands } from "@ngx/foundation";
import { AbstractFeature, Feature } from "@ngx/portal";
import { MatTableModule } from "@angular/material/table";

@Feature({
  id: 'about-dialog',
})
@Component({
    selector: 'about-dialog',
    templateUrl: './about.dialog.html',
    standalone: true,
    imports: [MatTableModule]
})
export class AboutDialog extends WithCommands(AbstractFeature) {
    // instance data

    dataSource : ModuleMetadata[] = []
    displayedColumns : string[] = ['name', 'type', 'version', 'isLoaded'];

    // constructor

    constructor(injector: Injector, public moduleRegistry : ModuleRegistry) {
        super(injector);

        this.dataSource = Object.values(moduleRegistry.modules)
    }

    // commands

    @Command({
      i18n: 'shell:ok',
    })
    ok() {
      return "ok"
    }
}
