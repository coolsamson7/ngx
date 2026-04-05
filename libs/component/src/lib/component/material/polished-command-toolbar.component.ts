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
    style?:             ToolbarStyle;
    iconPosition?:      IconPosition;
    labelMode?:         LabelMode;
    shortcutInTooltip?: boolean;
}

// ---------------------------------------------------------------------------
// Internal element model
// ---------------------------------------------------------------------------

abstract class ToolbarElement {
    abstract type: 'command' | 'menu';
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
    override type: 'command' = 'command';
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
    }
}

class ToolbarCommandMenuElement extends ToolbarElement {
    override type: 'menu' = 'menu';
    commands: CommandDescriptor[] = [];

    override get icon()     { return this.config.icon    ?? ''; }
    override get label()    { return this.config.label   ?? (this.name ?? ''); }
    override get tooltip()  { return this.config.tooltip ?? this.label; }
    override get shortcut() { return undefined; }

    constructor(
        toolbar: PolishedCommandToolbarComponent,
        command: CommandDescriptor,
        private config: ToolbarCommandConfig,
        existingMenu?: ToolbarCommandMenuElement
    ) {
        // Use config.menu (e.g., "XY") as the name/ID for grouping
        super(toolbar, config.menu!, existingMenu);

        if (!config.icon)  this.config.icon  = existingMenu ? existingMenu.icon  : command.icon;

        if (existingMenu) {
            this.commands = [...existingMenu.commands, command];
        } else {
            this.commands = [command];
        }
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

    <ng-container *ngIf="el.type === 'command'">
      <ng-container *ngTemplateOutlet="cmdBtn; context: { $implicit: asCommand(el) }"/>
    </ng-container>

    <ng-container *ngIf="el.type === 'menu'">
      <button mat-button
        [matMenuTriggerFor]="menu"
        [ngClass]="[btnClass, 'pct-menu-trigger']"
        [matTooltip]="el.tooltip"
        matTooltipPosition="below">

        <div class="pct-btn-content">
            <ng-container *ngTemplateOutlet="iconTpl; context: { icon: el.icon }"/>
            <span *ngIf="opts.labelMode === 'show'" class="pct-label">{{ el.label }}</span>
            <mat-icon class="pct-dropdown-arrow">arrow_drop_down</mat-icon>
        </div>
      </button>

      <mat-menu #menu="matMenu" class="pct-custom-menu">
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

<ng-template #cmdBtn let-el>
  <button mat-button
    [ngClass]="btnClass"
    [disabled]="!el.command.enabled"
    (click)="el.command.run()"
    [matTooltip]="cmdTooltip(el)"
    matTooltipPosition="below">
    <div class="pct-btn-content">
        <ng-container *ngTemplateOutlet="iconTpl; context: { icon: el.icon }"/>
        <span *ngIf="opts.labelMode === 'show'" class="pct-label">{{ el.label }}</span>
    </div>
  </button>
</ng-template>

<ng-template #iconTpl let-icon="icon">
  <svg-icon *ngIf="icon && opts.iconPosition !== 'none'" [name]="icon" class="pct-icon"/>
</ng-template>
    `,
    styles: [`
polished-command-toolbar { display: contents; }

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
}

/* ── Content Wrapper ── */
.pct-btn-content {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}

.pct-btn-top .pct-btn-content { flex-direction: column; gap: 4px; }
.pct-btn-left .pct-btn-content { flex-direction: row; gap: 6px; }

/* ── Specific Button Styles ── */
.pct-btn-top {
    height: 52px;
    min-width: 64px;
    padding: 0 8px;
    font-size: 11px;
}
.pct-btn-left {
    height: 32px;
    border-radius: 16px;
    font-size: 13px;
}

/* ── Menu Specifics ── */
.pct-dropdown-arrow {
    margin-left: -4px;
    font-size: 18px;
    width: 18px;
    height: 18px;
}
.pct-btn-top .pct-dropdown-arrow {
    position: absolute;
    right: 2px;
    top: 50%;
    transform: translateY(-50%);
}

.pct-icon { width: 20px; height: 20px; flex-shrink: 0; }
.pct-menu-icon { width: 18px; height: 18px; margin-right: 8px; }
.pct-menu-shortcut { margin-left: auto; padding-left: 16px; opacity: 0.6; font-size: 11px; }
    `]
})
export class PolishedCommandToolbarComponent implements CommandToolbar {
    
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

    get barClass() { return `pct-${this.opts.style}`; }
    get btnClass() { return `pct-btn-${this.opts.iconPosition}`; }

    cmdTooltip(el: ToolbarCommandElement): string {
        const parts = [this.opts.labelMode === 'tooltip' ? el.label : (el.tooltip || el.label)];
        if (this.opts.shortcutInTooltip && el.shortcut) parts.push(`(${el.shortcut})`);
        return parts.join(' ');
    }

    asCommand(el: ToolbarElement) { return el as ToolbarCommandElement; }
    asMenu(el: ToolbarElement) { return el as ToolbarCommandMenuElement; }
    trackByName(_: number, el: ToolbarElement) { return el.name; }

    addCommand(command: CommandDescriptor, config: ToolbarCommandConfig): () => void {
        const name = config.menu || command.name;
        const index = this.elements.findIndex(el => el.name === name);

        let newElement: ToolbarElement;

        if (config.menu) {
            // Group into menu
            const existing = index >= 0 ? this.elements[index] : undefined;
            newElement = new ToolbarCommandMenuElement(
                this,
                command,
                config,
                existing instanceof ToolbarCommandMenuElement ? existing : undefined
            );

            if (index >= 0) this.elements[index] = newElement;
            else this.elements.push(newElement);
        } else {
            // Standard command
            newElement = new ToolbarCommandElement(this, command, index >= 0 ? this.elements[index] : undefined);
            if (index >= 0) this.elements[index] = newElement;
            else this.elements.push(newElement);
        }

        this.cdr.markForCheck();
        return () => { newElement.revert(); };
    }
}