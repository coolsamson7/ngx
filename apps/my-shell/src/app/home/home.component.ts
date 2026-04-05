import { Component, Injector, ViewChild } from '@angular/core';
import { Command, ViewComponent, WithCommands, WithCommandToolbar, WithView } from '@ngx/foundation';
import { TranslatePipe } from '@ngx/i18n';
import { AbstractFeature, Feature } from '@ngx/portal';
import { WithDialogs, WithSnackbar } from '@ngx/ui';
import { CommandToolbarComponent } from '@ngx/component';
import { WithExtensions } from '../extension/with-extensions';
import { SampleExtensionPoint } from '../extension/sample.extension';
import { ButtonComponent } from '@ngx/component';

@Feature({
  id: 'home',
  isDefault: true,
})
@Component({
  standalone: true,
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [TranslatePipe, CommandToolbarComponent, ViewComponent, ButtonComponent],
})
export class HomeComponent extends WithExtensions(WithView(WithDialogs(WithSnackbar(WithCommandToolbar(WithCommands(AbstractFeature, {inheritCommands: false})))))) {
  extensionPoint! : SampleExtensionPoint
  @ViewChild(CommandToolbarComponent) override commandToolbar? : CommandToolbarComponent // TODO?????

  // constructor

  constructor(injector: Injector) {
    super(injector);

    this.addExtensionPoint(this.extensionPoint = new SampleExtensionPoint()).addMenu("home")

    // TEST

    this.extend()

    for ( const menu of this.extensionPoint.menus)
      console.log(menu)
  }

  // override WithCommandToolbar

  override buildToolbar() {
      this
        .addCommand2Toolbar("open")
        .addCommand2Toolbar("hello")
        .addCommand2Toolbar("ok")
        .addCommand2Toolbar("lockView", {menu: "more", icon: "help", tooltip: "Lock", label: "Lock" })
        .addCommand2Toolbar("lockCommand", {menu: "more", icon: "help", tooltip: "Lock", label: "Lock" })
        .addCommand2Toolbar("throwError")
        .addCommand2Toolbar("openPreferences")
  }

  // commands

  @Command({
      i18n: 'shell:open',
      icon: "forward",
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
    icon: "save"
  })
  hello(world: string = "world") {
    this.showSnackbar("hello" + world, { duration: 2000 })
  }

  @Command({
    i18n: 'shell:ok',
    icon: "help"
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

   @Command({
      label: 'Command',
      lock: "command"
    })
    async lockCommand() {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    @Command({
      label: 'View',
      lock: "view"
    })
    async lockView() {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

 @Command({
      label: 'Preferences',
      lock: "view"
    })
    async openPreferences() {
          this.openDialog({
              title: "Preferences",
              dialog: "preferences-dialog",
              buttons: ["ok", "cancel"]
            }).subscribe(result => {
              console.log("Dialog result:", result)
            });
    }

    @Command({
      label: 'Error',
      icon: "help"
    })
    async throwError() {
       throw new Error("ouch")
    }
}
