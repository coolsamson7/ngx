import { inject, Injector } from "@angular/core";
import { AbstractFeature } from "@ngx/portal";
import { PreferencesDialog } from "./preferences-dialog";

export abstract class AbstractPreferencesPage extends AbstractFeature {
  private dirty = false;
  private dialog : PreferencesDialog

  constructor(injector: Injector) {
    super(injector);

    this.dialog = inject(PreferencesDialog)
    
    this.dialog .selectPage(this);
  }

  setDirty(value = true) {
     this.dialog.setDirty(this.dirty = value);
  }

  isDirty(): boolean {
    return this.dirty;
  }

  async save(): Promise<void> {
    this.dirty = false;
  }
}