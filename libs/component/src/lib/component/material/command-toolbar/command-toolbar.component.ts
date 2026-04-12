import {
    Component,
    Input,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommandDescriptor } from '@ngx/foundation';

import { CommandButtonComponent, LabelMode, IconPosition } from './command-button.component';
import { CommandMenuButtonComponent } from './command-menu-button.component';
import { ToolbarCommandConfig } from '../../../with-command-toolbar.mixin';
import { CommandToolbar } from '../../components';

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

export interface ToolbarOptions {
    style?:             'tray' | 'flat';
    iconPosition?:      IconPosition;
    labelMode?:         LabelMode;
    shortcutInTooltip?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal element model
// ─────────────────────────────────────────────────────────────────────────────

abstract class ToolbarElement {
    type: 'command' | 'menu' = 'command';
    abstract get icon():    string;
    abstract get tooltip(): string;
    abstract get label():   string;

    constructor(
        protected toolbar: MaterialCommandToolbarComponent,
        public name:  string,
        public group: string | undefined,
        protected parent?: ToolbarElement,
    ) {}

    revert() {
        const i = this.toolbar.elements.indexOf(this);
        if (this.parent) this.toolbar.elements[i] = this.parent;
        else             this.toolbar.elements.splice(i, 1);
        this.toolbar['cdr'].markForCheck();
    }
}

class ToolbarCommandElement extends ToolbarElement {
    override get icon()    { return this.command.icon    ?? ''; }
    override get label()   { return this.command.label   ?? ''; }
    override get tooltip() { return this.command.tooltip ?? ''; }

    constructor(toolbar: MaterialCommandToolbarComponent, public command: CommandDescriptor, group: string | undefined, parent?: ToolbarElement) {
        super(toolbar, command.name, group, parent);
        this.type = 'command';
    }
}

class ToolbarMenuElement extends ToolbarElement {
    commands: CommandDescriptor[] = [];
    override get icon()    { return this.config.icon    ?? ''; }
    override get label()   { return this.config.label   ?? this.name; }
    override get tooltip() { return this.config.tooltip ?? this.label; }

    constructor(
        toolbar: MaterialCommandToolbarComponent,
        command: CommandDescriptor,
        private config: ToolbarCommandConfig,
        parent?: ToolbarMenuElement,
    ) {
        super(toolbar, config.menu!, config.group, parent);
        this.type = 'menu';
        if (parent) this.commands.push(...parent.commands);
        this.commands.push(command);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Rendered item type
// ─────────────────────────────────────────────────────────────────────────────

type RenderedItem =
    | { kind: 'separator' }
    | { kind: 'element'; el: ToolbarElement };

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

@Component({
    selector: 'command-toolbar',
    standalone: true,
    imports: [CommonModule, CommandButtonComponent, CommandMenuButtonComponent],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './command-toolbar.component.html',
    styleUrls:   ['./command-toolbar.component.scss'],
})
export class MaterialCommandToolbarComponent implements CommandToolbar {

    @Input() label   = false;
    @Input() options: ToolbarOptions = {};

    elements: ToolbarElement[] = [];
    private cdr = inject(ChangeDetectorRef);

    get opts() {
        return {
            style:             this.options.style             ?? 'tray',
            iconPosition:      this.options.iconPosition      ?? 'top',
            labelMode:         this.options.labelMode         ?? 'show',
            shortcutInTooltip: this.options.shortcutInTooltip ?? true,
        };
    }

    get renderedItems(): RenderedItem[] {
        const items: RenderedItem[] = [];
        let lastGroup: string | undefined = undefined;
        let first = true;

        for (const el of this.elements) {
            const g = el.group;
            if (!first && g !== lastGroup && g !== undefined && lastGroup !== undefined) {
                items.push({ kind: 'separator' });
            }
            items.push({ kind: 'element', el });
            lastGroup = g;
            first = false;
        }
        return items;
    }

    asCommand(el: ToolbarElement): ToolbarCommandElement | null {
        return el.type === 'command' ? el as ToolbarCommandElement : null;
    }
    asMenu(el: ToolbarElement): ToolbarMenuElement {
        return el as ToolbarMenuElement;
    }
    trackItem(_: number, item: RenderedItem) {
        return item.kind === 'separator' ? 'sep' : item.el.name;
    }

    addCommand(command: CommandDescriptor, config: ToolbarCommandConfig): () => void {
        const name  = config.menu ?? command.name;
        const group = config.group;
        const index = this.elements.findIndex(el => el.name === name);
        let newElement: ToolbarElement;

        if (config.menu) {
            const existing = index >= 0 ? this.elements[index] : undefined;
            newElement = new ToolbarMenuElement(
                this, command, config,
                existing instanceof ToolbarMenuElement ? existing : undefined,
            );
        } else {
            newElement = new ToolbarCommandElement(
                this, command, group,
                index >= 0 ? this.elements[index] : undefined,
            );
        }

        if (index >= 0) this.elements[index] = newElement;
        else            this.elements.push(newElement);

        this.cdr.markForCheck();
        return () => { newElement.revert(); };
    }
}