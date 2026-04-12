import {
    Component,
    Input,
    ViewEncapsulation,
    ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommandDescriptor } from '@ngx/foundation';
import * as commandButton from './command-button.component';
import { IconComponent } from '../../../icon';

@Component({
    selector: 'pct-command-menu-button',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule, IconComponent],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './command-menu-button.component.html',
    styleUrls:   ['./command-toolbar.component.scss'],
})
export class CommandMenuButtonComponent {
    @Input({ required: true }) commands!: CommandDescriptor[];
    @Input() icon         = '';
    @Input() label        = '';
    @Input() tooltip      = '';
    @Input() labelMode: commandButton.LabelMode       = 'show';
    @Input() iconPosition: commandButton.IconPosition = 'top';
}