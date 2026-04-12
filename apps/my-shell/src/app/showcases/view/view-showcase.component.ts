import { Component, Injector } from '@angular/core';
import { CommandToolbarComponent, WithCommandToolbar } from '@ngx/component';
import { Command, ViewComponent, WithCommands, WithView } from '@ngx/foundation';
import { AbstractFeature, Feature } from '@ngx/portal';

@Feature({
  id: "view-showcase",
  parent: "showcases",
  description: "view showcase",
  tags: ["showcase"],
  permissions: [],
  visibility: ["private", "public"],
  showcase: {
        title:       'View',
        description: 'A view showcase',
        group:       'Core',
        order:       1,
        docs:      'showcases/view/view-showcase.md',
        assets: [
          {
            type:    'ts',
            label:   'Source',
            path: 'showcases/view/view-showcase.component.ts',
          },
          {
            type:  'html',
            label: 'HTML',
            path:   'showcases/view/view-showcase.component.html',
          },
             {
            type:  'scss',
            label: 'SCSS',
            path:   'showcases/view/view-showcase.component.scss',
          },
        ]
      }
})
@Component({
    selector:        'view-showcase-page',
    standalone:      true,
    imports:         [CommandToolbarComponent, ViewComponent],
    templateUrl:     './view-showcase.component.html',
    styleUrls:       ['./view-showcase.component.scss'],
})
export class ViewShowcaseComponent extends WithView(WithCommandToolbar(WithCommands(AbstractFeature))) {
  constructor(injector: Injector) {
    super(injector);
  }

  // override WithCommandToolbar

  override buildToolbar() {
    this
        .addCommand2Toolbar("lockView", {menu: "more", icon: "help", tooltip: "Lock", label: "Lock" })
        .addCommand2Toolbar("lockCommand", {menu: "more", icon: "help", tooltip: "Lock", label: "Lock" })
        .addCommand2Toolbar("throwError", {group: "g1"})
        .addCommand2Toolbar("foo", {group: "g2"})
  }

  // commands

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
      label: 'Foo',
      shortcut: "ctrl+f",
      icon: "help"
  })
  async foo() {
      console.log("foo")
  }

   @Command({
       label: 'Error',
       icon: "help"
   })
   async throwError() {
       throw new Error("ouch")
   }
}
