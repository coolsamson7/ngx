import { CommonModule } from "@angular/common";
import { Component, Input, ViewEncapsulation } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";

import { CommandDescriptor } from "@ngx/foundation";

@Component({
    selector: 'command-menu-button',
    templateUrl: './command-menu-button.component.html',
    //styleUrls: ['./command-menu-button.component.scss'],
    standalone: true,
    imports: [
      // angular

      CommonModule,

      // material

      MatIconModule,
      MatButtonModule,
      MatMenuModule
    ],
    encapsulation: ViewEncapsulation.None
})
export class CommandMenuButtonComponent {
    // input

    @Input() icon!: string
    @Input() label!: string
    @Input() tooltip?: string
    @Input() commands : CommandDescriptor[] = []
}
