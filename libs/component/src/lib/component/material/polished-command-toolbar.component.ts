import {
    Component,
    Input,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    inject
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { CommandDescriptor } from "@ngx/foundation";
import { CommandToolbar, ToolbarCommandConfig } from "../components";
import { IconComponent } from "@ngx/ui";

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export type ToolbarStyle = 'tray' | 'pill' | 'compact';
export type IconPosition = 'top' | 'left' | 'none';
export type LabelMode    = 'show' | 'hide' | 'tooltip';

export interface PolishedToolbarOptions {
    /** visual style of the bar                    default: 'tray'  */
    style?:             ToolbarStyle;
    /** where the icon sits relative to the label  default: 'top'   */
    iconPosition?:      IconPosition;
    /** whether/how the label is shown             default: 'show'  */
    labelMode?:         LabelMode;
    /** show shortcut in tooltip                   default: true    */
    shortcutInTooltip?: boolean;
}

// ---------------------------------------------------------------------------
// Internal element model
// ---------------------------------------------------------------------------

abstract class ToolbarElement {
    type: 'command' | 'menu' = 'command';
    abstract get icon():     string;
    abstract get tooltip():  string;
    abstract get label():    string;
    abstract get shortcut(): string | undefined;

    constructor(
        protected toolbar: PolishedCommandToolbarComponent,
        public name: string,
        protected parent?: ToolbarElement
    ) {}

    revert() {
        const i = this.toolbar.elements.indexOf(this);
        if (this.parent)
            this.toolbar.elements[i] = this.parent;
        else
            this.toolbar.elements.splice(i, 1);
        this.toolbar['cdr'].markForCheck();
    }
}

class ToolbarCommandElement extends ToolbarElement {
    override get icon()     { return this.command.icon    ?? ''; }
    override get label()    { return this.command.label   ?? ''; }
    override get tooltip()  { return this.command.tooltip ?? ''; }
    override get shortcut() { return this.command.shortcut; }

    constructor(
        toolbar: PolishedCommandToolbarComponent,
        public command: CommandDescriptor,
        parent?: ToolbarElement
    ) {
        super(toolbar, command.name, parent);
        this.type = 'command';
    }
}

class ToolbarCommandMenuElement extends ToolbarElement {
    commands: CommandDescriptor[] = [];

    override get icon()     { return this.config.icon    ?? ''; }
    override get label()    { return this.config.label   ?? ''; }
    override get tooltip()  { return this.config.tooltip ?? ''; }
    override get shortcut() { return undefined; }

    constructor(
        toolbar: PolishedCommandToolbarComponent,
        command: CommandDescriptor,
        private config: ToolbarCommandConfig,
        parent?: ToolbarCommandMenuElement
    ) {
        super(toolbar, config.menu!, parent);

        if (!config.icon)  config.icon  = parent ? parent.icon  : command.icon;
        if (!config.label) config.label = parent ? parent.label : command.label;

        this.type = 'menu';
        if (parent) this.commands.push(...parent.commands);
        this.commands.push(command);
    }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

@Component({
    selector: 'polished-command-toolbar',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatMenuModule,
        IconComponent
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
<div class="pct-bar" [ngClass]="barClass">

  <ng-container *ngFor="let el of elements; trackBy: trackByName">

    <!-- single command -->
    <ng-container *ngIf="el.type === 'command'">
      <ng-container *ngTemplateOutlet="cmdBtn; context: { $implicit: asCommand(el) }"/>
    </ng-container>

    <!-- menu -->
    <ng-container *ngIf="el.type === 'menu'">
      <button mat-button
        [matMenuTriggerFor]="menu"
        [ngClass]="btnClass"
        [matTooltip]="menuTooltip(el)"
        matTooltipPosition="below">
        <ng-container *ngTemplateOutlet="iconTpl; context: { icon: el.icon }"/>
        <span *ngIf="opts.labelMode === 'show'" class="pct-label">{{ el.label }}</span>
      </button>

      <mat-menu #menu="matMenu">
        <button mat-menu-item
          *ngFor="let cmd of asMenu(el).commands"
          [disabled]="!cmd.enabled"
          (click)="cmd.run()">
          <svg-icon *ngIf="cmd.icon" [name]="cmd.icon" class="pct-menu-icon"/>
          <span>{{ cmd.label }}</span>
          <span *ngIf="cmd.shortcut" class="pct-menu-shortcut">{{ cmd.shortcut }}</span>
        </button>
      </mat-menu>
    </ng-container>

  </ng-container>
</div>

<!-- command button template -->
<ng-template #cmdBtn let-el>
  <button mat-button
    [ngClass]="btnClass"
    [disabled]="!el.command.enabled"
    (click)="el.command.run()"
    [matTooltip]="cmdTooltip(el)"
    matTooltipPosition="below">
    <ng-container *ngTemplateOutlet="iconTpl; context: { icon: el.icon }"/>
    <span *ngIf="opts.labelMode === 'show'" class="pct-label">{{ el.label }}</span>
  </button>
</ng-template>

<!-- icon template -->
<ng-template #iconTpl let-icon="icon">
  <svg-icon *ngIf="icon && opts.iconPosition !== 'none'" [name]="icon" class="pct-icon"/>
</ng-template>
    `,
    styles: [`
polished-command-toolbar { display: contents; }

/* ── bar ── */
.pct-bar {
    display:     inline-flex;
    align-items: center;
    gap:         2px;
    padding:     3px 6px;
}
.pct-bar.pct-tray {
    background:    var(--mat-sys-surface-container-low);
    border:        1px solid var(--mat-sys-outline-variant);
    border-radius: 10px;
    padding:       4px 6px;
}
.pct-bar.pct-pill    { gap: 6px; }
.pct-bar.pct-compact { gap: 0; }

/* ── override mat-button's internal label wrapper ── */
/* this is the key fix for icon-top: the MDC label is a flex row by default */
.pct-btn-top .mdc-button__label {
    display:        flex;
    flex-direction: column;
    align-items:    center;
    gap:            4px;
}
.pct-btn-left .mdc-button__label {
    display:        flex;
    flex-direction: row;
    align-items:    center;
    gap:            6px;
}
.pct-btn-none .mdc-button__label {
    display:        flex;
    flex-direction: row;
    align-items:    center;
}

/* ── icon-top style ── */
.pct-btn-top {
    height:      52px;
    min-width:   56px;
    padding:     0 8px;
    border-radius: 8px;
    font-size:   12px;
    line-height: 1;
    letter-spacing: 0;
    color: var(--mat-sys-on-surface-variant);
}
.pct-btn-top:hover { color: var(--mat-sys-on-surface); }

/* ── pill (icon-left) style ── */
.pct-btn-left {
    height:        32px;
    padding:       0 16px 0 12px;
    border-radius: 999px;
    border:        1px solid var(--mat-sys-outline-variant);
    font-size:     13px;
    letter-spacing: 0.01em;
    color: var(--mat-sys-on-surface-variant);
}
.pct-btn-left:hover {
    border-color: var(--mat-sys-outline);
    color:        var(--mat-sys-on-surface);
}

/* ── compact (icon-none / label-only) style ── */
.pct-btn-none {
    height:        36px;
    padding:       0 12px;
    border-radius: 6px;
    font-size:     13px;
    letter-spacing: 0.01em;
    color: var(--mat-sys-on-surface-variant);
}
.pct-btn-none:hover { color: var(--mat-sys-on-surface); }

/* ── icon ── */
.pct-icon { width: 18px; height: 18px; display: block; flex-shrink: 0; }

/* ── label ── */
.pct-label { line-height: 1.2; }

/* ── separator ── */
.pct-sep {
    width:       1px;
    height:      24px;
    background:  var(--mat-sys-outline-variant);
    margin:      0 4px;
    flex-shrink: 0;
}

/* ── menu items ── */
.pct-menu-icon     { width: 18px; height: 18px; margin-right: 8px; vertical-align: middle; }
.pct-menu-shortcut { margin-left: auto; padding-left: 24px; font-size: 12px; color: var(--mat-sys-on-surface-variant); }
    `]
})
export class PolishedCommandToolbarComponent implements CommandToolbar {

    @Input() label = false;
    @Input() options: PolishedToolbarOptions = {};

    elements: ToolbarElement[] = [];

    private cdr = inject(ChangeDetectorRef);

    get opts(): Required<PolishedToolbarOptions> {
        return {
            style:             this.options.style             ?? 'tray',
            iconPosition:      this.options.iconPosition      ?? 'top',
            labelMode:         this.options.labelMode         ?? 'show',
            shortcutInTooltip: this.options.shortcutInTooltip ?? true,
        };
    }

    get barClass(): string {
        return `pct-${this.opts.style}`;
    }

    /** Drives both the host class and the mdc-button__label flex direction */
    get btnClass(): string {
        return `pct-btn-${this.opts.iconPosition}`;
    }

    cmdTooltip(el: ToolbarCommandElement): string {
        const parts: string[] = [];

        if (this.opts.labelMode === 'tooltip')
            parts.push(el.label);
        else if (el.tooltip)
            parts.push(el.tooltip);

        if (this.opts.shortcutInTooltip && el.shortcut)
            parts.push(`(${el.shortcut})`);

        return parts.join(' ');
    }

    menuTooltip(el: ToolbarElement): string {
        return el.tooltip;
    }

    asCommand(el: ToolbarElement): ToolbarCommandElement {
        return el as ToolbarCommandElement;
    }

    asMenu(el: ToolbarElement): ToolbarCommandMenuElement {
        return el as ToolbarCommandMenuElement;
    }

    trackByName(_: number, el: ToolbarElement): string {
        return el.name;
    }

    addCommand(command: CommandDescriptor, config: ToolbarCommandConfig): () => void {
        const name  = config.menu ?? command.name;
        const index = this.elements.findIndex(el => el.name === name);

        let newElement: ToolbarElement;

        if (config.menu) {
            if (index >= 0)
                this.elements[index] = newElement = new ToolbarCommandMenuElement(
                    this, command, config, this.elements[index] as ToolbarCommandMenuElement
                );
            else
                this.elements.push(newElement = new ToolbarCommandMenuElement(this, command, config));
        } else {
            if (index >= 0)
                this.elements[index] = newElement = new ToolbarCommandElement(this, command, this.elements[index]);
            else
                this.elements.push(newElement = new ToolbarCommandElement(this, command));
        }

        this.cdr.markForCheck();
        return () => { newElement.revert(); };
    }
}