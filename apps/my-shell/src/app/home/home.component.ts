import { Component, Injector } from '@angular/core';
import { Command, WithCommands } from '@ngx/foundation';
import { TranslatePipe } from '@ngx/i18n';
import { AbstractFeature, Feature } from '@ngx/portal';
import { WithDialogs, WithSnackbar } from '@ngx/ui';
import { TestDialogComponent } from './test-dialog';


const a = TestDialogComponent

@Feature({
  id: 'home',
  isDefault: true,
})
@Component({
  standalone: true,
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [TranslatePipe],
})
export class HomeComponent extends WithDialogs(WithSnackbar(WithCommands(AbstractFeature, {inheritCommands: false}))) {
  // constructor

  constructor(injector: Injector) {
    super(injector);
  }

  // commands

  @Command({
      i18n: 'shell:hello',
  })
  open() {
    this.openDialog({
      title: "Title", 
      dialog: "test-dialog",
      buttons: ["ok", "cancel"]
    });
  }

  @Command({
    i18n: 'shell:hello',
  })
  hello() {
    console.log("hello")

    this.showSnackbar("Hello world!", { duration: 2000 })
  }

  @Command({
    i18n: 'shell:ok',
  })
  ok() {
    this.confirmationDialog()
      .title("Confirmation")
      .message("Hello world!")
      .okCancel()
      .show().subscribe(result => {
        console.log("Dialog result:", result)
      })
  }
}
