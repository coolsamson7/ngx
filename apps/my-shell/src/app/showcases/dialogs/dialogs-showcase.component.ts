import { Component, Injector } from '@angular/core';
import { ButtonComponent } from '@ngx/component';
import { AbstractFeature, Feature } from '@ngx/portal';
import { WithDialogs } from '@ngx/ui';

@Feature({
  id: "dialogs-showcase",
  parent: "showcases",
  description: "dialogs showcase",
  tags: ["showcase"],
  permissions: [],
  visibility: ["private", "public"],
  showcase: {
        title:       'Dialogs',
        description: 'How to open dialogs',
        group:       'Addon',
        order:       1,
        docs:      'showcases/dialogs/dialogs-showcase.md',
        assets: [
          {
            type:    'ts',
            label:   'Source',
            path: 'showcases/dialogs/dialogs-showcase.component.ts',
          },
          {
            type:  'html',
            label: 'HTML',
            path:   'showcases/dialogs/dialogs-showcase.component.html',
          },
             {
            type:  'scss',
            label: 'SCSS',
            path:   'showcases/dialogs/dialogs-showcase.component.scss',
          },
        ]
      }
})
@Component({
    selector:        'dialogs-showcase',
    standalone:      true,
    imports:         [ButtonComponent],
    templateUrl:     './dialogs-showcase.component.html',
    styleUrls:       ['./dialogs-showcase.component.scss'],
})
export class DialogsShowcaseComponent extends WithDialogs(AbstractFeature) {
  constructor(injector: Injector) {
    super(injector);
  }

  // callbacks

  openFeatureDialog() {
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

  openConfirmationDialog() {
      this.confirmationDialog()
        .title("Confirmation")
        .message("Hello world!")
        .okCancel()
        .show().subscribe(result => {
          console.log("Dialog result:", result)
        })
  }
}
