import { Component, Injector, OnInit } from '@angular/core';
import { ButtonComponent } from '@ngx/component';
import { Command, WithCommands } from '@ngx/foundation';
import { AbstractFeature, Feature } from '@ngx/portal';

@Feature({
  id: "command-showcase",
  parent: "showcases",
  description: "command showcase",
  tags: ["showcase"],
  permissions: [],
  visibility: ["private", "public"],
  showcase: {
        title:       'Commands',
        description: 'A sample shocign the usage of commands',
        group:       'Core',
        order:       1,
        docs:      'showcases/commands/command-showcase.md',
        assets: [
          {
            type:    'ts',
            label:   'Source',
            path: 'showcases/commands/command-showcase.component.ts',
          },
          {
            type:  'html',
            label: 'HTML',
            path:   'showcases/commands/command-showcase.component.html',
          },
             {
            type:  'scss',
            label: 'SCSS',
            path:   'showcases/commands/command-showcase.component.scss',
          },
        ]
      }
})
@Component({
    selector:        'command-showcase-page',
    standalone:      true,
    imports:         [ButtonComponent],
    templateUrl:     './command-showcase.component.html',
    styleUrls:       ['./command-showcase.component.scss'],
})
export class CommandShowcaseComponent extends WithCommands(AbstractFeature) implements OnInit {
  constructor(injector: Injector) {
    super(injector);
  }

  // implement OnInit if you need to do something on init, e.g. register commands dynamically
  
  override ngOnInit(): void {
    super.ngOnInit();

    this.setCommandEnabled('open', true);

    // call it

    this.runCommand('open';
  }

  // commands

  @Command({
    i18n: 'shell:open',
    icon: "forward",
  })
  open() {
    console.log("open")
  }
}
