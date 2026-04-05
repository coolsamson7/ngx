// sample-preference.ts
import { Component, Injector } from "@angular/core";
import { Feature } from "@ngx/portal";
import { AbstractPreferencesPage } from "../preferences-feature";
import { FormsModule } from "@angular/forms";

@Feature({
  id: 'preferences-1',
  tags: ["preferences"]
})
@Component({
  standalone: true,
  selector: 'preferences-page-1',
  imports: [FormsModule],
  templateUrl: './sample-crud-preference.html',
   styleUrls: ['./sample-crud-preference.scss']  ,
})
export class SampleCrudPreferencesComponent extends AbstractPreferencesPage {
  name = 'John';
  surname = 'Doe';

  private savedName = this.name;
  private savedSurname = this.surname;

  constructor(injector: Injector) {
    super(injector);
  }

  override isDirty(): boolean {
    return this.name !== this.savedName || this.surname !== this.savedSurname;
  }

  override async save(): Promise<void> {
    this.savedName = this.name;
    this.savedSurname = this.surname;

    this.setDirty(false)
  }
}