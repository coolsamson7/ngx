import { Component, Injector } from "@angular/core";
import { Command, WithCommands } from "@ngx/foundation";
import { AbstractFeature, Feature, FeatureData, FeatureRegistry, FeatureOutletDirective } from "@ngx/portal";

import { AbstractPreferencesPage } from "./preferences-feature";
import { VetoError, WithDialogs } from "@ngx/ui";
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

        this.updateCommandState();
    }

    // private

    private async checkDirty(): Promise<boolean> {
        if (!this.selectedPageFeature?.isDirty())
          return true;

        const choice = await firstValueFrom(
          this.confirmationDialog()
            .title("Unsaved Changes")
            .message("You have unsaved changes. \nDo you want to save them?")
            .button({ label: "Save", result: "save", primary: true   })
            .button({ label: "Discard", result: "discard" })
            .button({ label: "Cancel", result: "cancel" })
            .show()
        );

        if (choice === "save") {
          await this.selectedPageFeature!.save();  // works whether save() is sync or async Promise
          return true
        }

        return choice === "discard";
    }

    // callbacks

    setDirty(dirty: boolean = false) {
      this.updateCommandState();
    }

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

    // override

    updateCommandState() {
      this.setCommandEnabled("ok", true)
      this.setCommandEnabled("cancel", true)
      this.setCommandEnabled("apply", this.selectedPageFeature?.isDirty() ?? false)
    }

    // commands

    @Command({
      i18n: 'shell:ok',
    })
    async ok() {
      const proceed = await this.checkDirty();
      
      if (!proceed) 
        throw new VetoError();

      return "ok"
    }

    @Command({
      i18n: 'shell:cancel',
    })
    cancel() {
      return "cancel"
    }

    @Command({ i18n: 'shell:apply' })
    async apply() {
      if (this.selectedPageFeature?.isDirty())
        await this.selectedPageFeature.save();

      throw new VetoError(); // stay open
    }
}
