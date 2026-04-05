import { inject, Injector } from "@angular/core";
import { AbstractFeature } from "@ngx/portal";
import { PreferencesDialog } from "./preferences-dialog";

export abstract class AbstractPreferencesPage extends AbstractFeature {
    private dirty = false;

  constructor(injector: Injector) {
    super(injector);
    inject(PreferencesDialog).selectPage(this);
  }

  setDirty(value = true) {
    this.dirty = value;
  }

  isDirty(): boolean {
    return this.dirty;
  }

  async save(): Promise<void> {
    this.dirty = false;
  }
}