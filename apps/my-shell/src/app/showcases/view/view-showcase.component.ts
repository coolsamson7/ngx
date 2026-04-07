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
            path: 'showcases/view/saviewmple-showcase.component.ts',
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
    imports:         [ CommandToolbarComponent, ViewComponent],
    templateUrl:     './view-showcase.component.html',
    styleUrls:       ['./view-showcase.component.scss'],
})
export class ViewShowcaseComponent extends WithView(WithCommandToolbar(WithCommands(AbstractFeature))) {
  //@ViewChild(CommandToolbarComponent) override commandToolbar? : CommandToolbarComponent // TODO?????

  constructor(injector: Injector) {
    super(injector);
  }

  // override WithCommandToolbar

  override buildToolbar() {
    this.addCommand2Toolbar("open")
  }

  // commands

  @Command({
        i18n: 'shell:open',
        icon: "forward",
  })
  open() {}
}
