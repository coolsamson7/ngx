import { Component, Injector } from "@angular/core";
import { Command, WithCommands } from "@ngx/foundation";
import { AbstractFeature, Feature, FeatureData, FeatureRegistry, FeatureOutletDirective } from "@ngx/portal";

import { AbstractPreferencesPage } from "./preferences-feature";
import { WithDialogs } from "@ngx/ui";
import { firstValueFrom } from "rxjs";
import { NgFor } from "@angular/common";

@Feature({
  id: 'preferences-dialog',
})
@Component({
    selector: 'preferences-dialog',
    templateUrl: './preferences-dialog.html',
    styleUrl: './preferences-dialog.scss',
    standalone: true,
    imports: [FeatureOutletDirective]//NgFor
})
export class PreferencesDialog extends WithDialogs(WithCommands(AbstractFeature)) {
    // instance data

    pages : FeatureData[] = []
    selectedPage : FeatureData
    selectedPageFeature : AbstractPreferencesPage | undefined = undefined

    // constructor

    constructor(injector: Injector, public featureRegistry : FeatureRegistry) {
        super(injector);

        this.pages = featureRegistry.finder().withTag("preferences").find();
        this.selectedPage = this.pages[0]
    }

    // private

    private async checkDirty(): Promise<boolean> {
          if (!this.selectedPageFeature?.isDirty())
            return true;

          const confirmed = await firstValueFrom(
            this.confirmationDialog()
              .title("Unsaved Changes")
              .message("You have unsaved changes. Do you want to save them?")
              .okCancel()
              .show()
          );

          if (confirmed) {
            await this.selectedPageFeature!.save();  // works whether save() is sync or async Promise
          }

          return confirmed;
      }

    // callbacks

    async selectFeature(feature: FeatureData) {
      if (feature === this.selectedPage) return;

      const proceed = await this.checkDirty();

      if (proceed) {
        this.selectedPage = feature;
        this.selectedPageFeature = undefined;
      }
    }

    selectPage(page: AbstractPreferencesPage) {
      this.selectedPageFeature = page
    }

    // commands

    @Command({
      i18n: 'shell:ok',
    })
    async ok() {
      if (this.selectedPageFeature?.isDirty()) {
          await this.selectedPageFeature.save();
      }
    }

    @Command({
      i18n: 'shell:cancel',
    })
    cancel() {
      return "ok"
    }
}
