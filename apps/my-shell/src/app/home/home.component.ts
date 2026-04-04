import { Component, Injector } from '@angular/core';
import { Command, WithCommands } from '@ngx/foundation';
import { TranslatePipe } from '@ngx/i18n';
import { AbstractFeature, Feature } from '@ngx/portal';
import { WithDialogs, WithSnackbar } from '@ngx/ui';
import { TestDialogComponent } from './test-dialog';
import { WithExtensions } from '../extension/with-extensions';
import { SampleExtensionPoint } from '../extension/sample.extension';


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
export class HomeComponent extends WithExtensions(WithDialogs(WithSnackbar(WithCommands(AbstractFeature, {inheritCommands: false})))) {
  extensionPoint! : SampleExtensionPoint 

  // constructor

  constructor(injector: Injector) {
    super(injector);

    this.addExtensionPoint(this.extensionPoint = new SampleExtensionPoint()).addMenu("home")

    // TEST

    this.extend()

    for ( const menu of this.extensionPoint.menus)
      console.log(menu)
  }

  // commands

  @Command({
      i18n: 'shell:hello',
  })
  open() {
    this.openDialog({
      title: "Title", 
      dialog: "test-dialog",
      buttons: ["ok", "cancel"],
      onStartup: {
        command: "hello",
        args: ["world"]
      }
    }).subscribe(result => {
      console.log("Dialog result:", result)
    });
  }

  @Command({
    i18n: 'shell:hello',
  })
  hello(world: string = "world") {
    this.showSnackbar("hello" + world, { duration: 2000 })
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
