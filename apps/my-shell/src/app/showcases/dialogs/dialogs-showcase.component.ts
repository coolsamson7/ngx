import { Component, Injector } from '@angular/core';
import { AbstractFeature, Feature } from '@ngx/portal';

@Feature({
  id: "dialogs-showcase",
  parent: "showcases",
  description: "showcase",
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
    imports:         [],
    templateUrl:     './dialogs-showcase.component.html',
    styleUrls:       ['./dialogs-showcase.component.scss'],
})
export class DialogsShowcaseComponent extends AbstractFeature {
  constructor(injector: Injector) {
    super(injector);
  }
}
