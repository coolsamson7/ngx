import {
    Component,
    Input,
    OnInit,
    OnDestroy,
    ViewChild,
    ViewEncapsulation,
    ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommandDescriptor, CommandListener, ExecutionContext } from '@ngx/foundation';

import { MatRipple, MatRippleModule } from '@angular/material/core';
import { IconComponent } from '../../../icon';

export type LabelMode    = 'show' | 'tooltip' | 'none';
export type IconPosition = 'top'  | 'left'    | 'none';

@Component({
    selector: 'pct-command-button',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatTooltipModule, IconComponent, MatRippleModule],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './command-button.component.html',
    styleUrls:   ['./command-toolbar.component.scss'],
})
export class CommandButtonComponent implements OnInit, OnDestroy, CommandListener {

    @Input({ required: true }) command!: CommandDescriptor;
    @Input() labelMode: LabelMode       = 'show';
    @Input() iconPosition: IconPosition = 'top';
    @Input() shortcutInTooltip = true;

    @ViewChild('btn', { read: MatRipple }) private ripple!: MatRipple;

    get tooltip(): string {
        const parts: string[] = [];
        if (this.labelMode === 'tooltip' && this.command.label)
            parts.push(this.command.label);
        else if (this.command.tooltip)
            parts.push(this.command.tooltip);
        if (this.shortcutInTooltip && this.command.shortcut)
            parts.push(`(${this.command.shortcut})`);
        return parts.join(' ');
    }

    ngOnInit()    { this.command.addListener(this); }
    ngOnDestroy() { /*this.command.removeListener?.(this); TODO */ }

    onCall(context: ExecutionContext): void {
        if (context.data?.fromShortcut) {
            this.ripple?.launch({ centered: true });
        }
    }

    onResult(_context: ExecutionContext): void {}
    onError(_context: ExecutionContext):  void {}
}