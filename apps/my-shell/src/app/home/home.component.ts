import { Component, Injector } from '@angular/core';
import { Command, ViewComponent, WithCommands, WithView } from '@ngx/foundation';
import { TranslatePipe } from '@ngx/i18n';
import { AbstractFeature, Feature } from '@ngx/portal';
import { CommandToolbarComponent, IconComponent, WithCommandToolbar, WithDialogs, WithSnackbar } from '@ngx/ui';
import { WithExtensions } from '../extension/with-extensions';
import { SampleExtensionPoint } from '../extension/sample.extension';

@Feature({
  id: 'home',
  isDefault: true,
})
@Component({
  standalone: true,
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [TranslatePipe, CommandToolbarComponent, ViewComponent, IconComponent],
})
export class HomeComponent extends WithExtensions(WithView(WithDialogs(WithSnackbar(WithCommandToolbar(WithCommands(AbstractFeature, {inheritCommands: false})))))) {
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

  // override WithCommandToolbar

  override buildToolbar() {
      this
        .addCommand2Toolbar("open")
        .addCommand2Toolbar("hello")
        .addCommand2Toolbar("ok")
        .addCommand2Toolbar("lockView")
        .addCommand2Toolbar("lockCommand")
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
      label: 'Long Running Command',
      icon: "help",
      lock: "command"
    })
    async lockCommand() {
        console.log(">")
        await new Promise(resolve => setTimeout(resolve, 1000));
         console.log("<")
    }

    @Command({
      label: 'Loch View COmmand',
      icon: "help",
      lock: "view"
    })
    async lockView() {
        console.log(">")
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("<")
    }
}
