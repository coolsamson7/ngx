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
// Internal element models
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
        if (this.parent) this.toolbar.elements[i] = this.parent;
        else this.toolbar.elements.splice(i, 1);
        this.toolbar['cdr'].markForCheck();
    }
}

class ToolbarCommandElement extends ToolbarElement {
    override get icon()     { return this.command.icon    ?? ''; }
    override get label()    { return this.command.label   ?? ''; }
    override get tooltip()  { return this.command.tooltip ?? ''; }
    override get shortcut() { return this.command.shortcut; }

    constructor(toolbar: PolishedCommandToolbarComponent, public command: CommandDescriptor, parent?: ToolbarElement) {
        super(toolbar, command.name, parent);
        this.type = 'command';
    }
}

class ToolbarCommandMenuElement extends ToolbarElement {
    commands: CommandDescriptor[] = [];
    override get icon()     { return this.config.icon    ?? ''; }
    override get label()    { return this.config.label   ?? this.name; }
    override get tooltip()  { return this.config.tooltip ?? this.label; }
    override get shortcut() { return undefined; }

    constructor(toolbar: PolishedCommandToolbarComponent, command: CommandDescriptor, private config: ToolbarCommandConfig, parent?: ToolbarCommandMenuElement) {
        super(toolbar, config.menu!, parent);
        this.type = 'menu';
        if (parent) this.commands.push(...parent.commands);
        this.commands.push(command);
    }
}

@Component({
    selector: 'polished-command-toolbar',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, MatMenuModule, IconComponent],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
<div class="pct-bar" [ngClass]="barClass">
  <ng-container *ngFor="let el of elements; trackBy: trackByName">

    <button mat-button
      [ngClass]="[btnClass, el.type === 'menu' ? 'pct-menu-trigger' : '']"
      [disabled]="el.type === 'command' ? !asCommand(el).command.enabled : false"
      (click)="el.type === 'command' ? asCommand(el).command.run() : null"
      [matMenuTriggerFor]="el.type === 'menu' ? menu : null"
      [matTooltip]="el.type === 'command' ? cmdTooltip(asCommand(el)) : el.tooltip"
      matTooltipPosition="below">
      
      <div class="pct-btn-body">
        <div class="pct-btn-stack">
          <svg-icon *ngIf="el.icon && opts.iconPosition !== 'none'" [name]="el.icon" class="pct-icon"></svg-icon>
          <span *ngIf="opts.labelMode === 'show'" class="pct-label">{{ el.label }}</span>
        </div>

        <mat-icon *ngIf="el.type === 'menu'" class="pct-arrow">arrow_drop_down</mat-icon>
      </div>

    </button>

    <mat-menu #menu="matMenu" class="pct-dropdown-panel">
      <button mat-menu-item 
        *ngFor="let cmd of (el.type === 'menu' ? asMenu(el).commands : [])"
        [disabled]="!cmd.enabled"
        (click)="cmd.run()">
        <svg-icon *ngIf="cmd.icon" [name]="cmd.icon" class="pct-menu-icon"></svg-icon>
        <span class="pct-menu-label">{{ cmd.label }}</span>
        <span *ngIf="cmd.shortcut" class="pct-menu-shortcut">{{ cmd.shortcut }}</span>
      </button>
    </mat-menu>

  </ng-container>
</div>
    `,
    styles: [`
/* --- Container --- */
.pct-bar { display: inline-flex; align-items: center; gap: 4px; padding: 4px; }
.pct-bar.pct-tray { background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; }

/* --- Button Global Fixes --- */
.pct-bar .mdc-button {
    font-family: inherit !important;
    font-weight: 400 !important;
    color: var(--mat-sys-on-surface-variant) !important;
    --mdc-text-button-label-text-color: var(--mat-sys-on-surface-variant);
}
.pct-bar .mdc-button:hover { color: var(--mat-sys-on-surface) !important; }

/* Remove the "Blue" and "Bold" defaults */
.pct-bar .mdc-button__label {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100%;
    height: 100%;
}

/* --- Layout Body --- */
.pct-btn-body {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 100%;
}

.pct-btn-stack {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center; 
    flex: 1;
}

/* --- Top Mode (Tray) --- */
.pct-btn-top {
    height: 52px;
    min-width: 60px;
    padding: 0 12px !important;
    border-radius: 8px !important;
}
.pct-btn-top .pct-btn-stack { 
    flex-direction: column; 
    gap: 6px; 
    align-items: center; /* horizontal center */
    justify-content: center;
}
.pct-btn-top .pct-label { font-size: 11px; }

/* --- Left Mode (Pill) --- */
.pct-btn-left {
    height: 32px;
    padding: 0 16px !important;
    border-radius: 16px !important;
    border: 1px solid var(--mat-sys-outline-variant);
}
.pct-btn-left .pct-btn-stack { flex-direction: row; gap: 8px; }
.pct-btn-left .pct-label { font-size: 13px; }

/* --- The Arrow --- */
.pct-arrow {
    font-size: 18px !important;
    width: 18px !important;
    height: 18px !important;
    margin: 0 !important;
    opacity: 0.6;
}

/* In Top mode, we want the arrow to the right of the whole stack */
.pct-btn-top .pct-arrow {
    position: absolute;
    right: -8px;
    top: 50%;
    transform: translateY(-50%);
}

/* In Left mode, we just let it flow after the text */
.pct-btn-left .pct-arrow { margin-left: 2px !important; }

/* --- Visuals --- */
.pct-icon { width: 20px; height: 20px; display: block; }
.pct-label { line-height: 1; font-weight: 400; }

/* --- Menu --- */
.pct-dropdown-panel.mat-mdc-menu-panel { min-width: 140px !important; }
.pct-dropdown-panel .mat-mdc-menu-item {
    height: 36px !important;
    min-height: 36px !important;
    font-size: 13px !important;
    font-family: inherit !important;
}
    `]
})
export class PolishedCommandToolbarComponent implements CommandToolbar {
    @Input() options: any = {};
    elements: ToolbarElement[] = [];
    private cdr = inject(ChangeDetectorRef);

    get opts() {
        return {
            style: this.options.style ?? 'tray',
            iconPosition: this.options.iconPosition ?? 'top',
            labelMode: this.options.labelMode ?? 'show',
            shortcutInTooltip: this.options.shortcutInTooltip ?? true,
        };
    }

    get barClass() { return `pct-${this.opts.style}`; }
    get btnClass() { return `pct-btn-${this.opts.iconPosition}`; }

    cmdTooltip(el: ToolbarCommandElement): string {
        const parts: string[] = [];
        if (this.opts.labelMode === 'tooltip') parts.push(el.label);
        else if (el.tooltip) parts.push(el.tooltip);
        if (this.opts.shortcutInTooltip && el.shortcut) parts.push(`(${el.shortcut})`);
        return parts.join(' ');
    }

    asCommand(el: ToolbarElement) { return el as ToolbarCommandElement; }
    asMenu(el: ToolbarElement) { return el as ToolbarCommandMenuElement; }
    trackByName(_: number, el: ToolbarElement) { return el.name; }

    addCommand(command: CommandDescriptor, config: ToolbarCommandConfig): () => void {
        const name = config.menu ?? command.name;
        const index = this.elements.findIndex(el => el.name === name);
        let newElement: ToolbarElement;

        if (config.menu) {
            const existing = index >= 0 ? this.elements[index] : undefined;
            newElement = new ToolbarCommandMenuElement(this, command, config, existing instanceof ToolbarCommandMenuElement ? existing : undefined);
        } else {
            newElement = new ToolbarCommandElement(this, command, index >= 0 ? this.elements[index] : undefined);
        }

        if (index >= 0) this.elements[index] = newElement;
        else this.elements.push(newElement);

        this.cdr.markForCheck();
        return () => { newElement.revert(); };
    }
}