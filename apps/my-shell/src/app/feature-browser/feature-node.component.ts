import {
    Component,
    Input,
    ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import type { FeatureData } from '@ngx/portal';

export interface VisibilityBadge { label: string; color: string; }

export function visibilityBadge(vis: string[] = ['public']): VisibilityBadge {
    if (vis.includes('public') && vis.includes('private'))
        return { label: 'public + private', color: '#10b981' };
    if (vis.includes('private'))
        return { label: 'private', color: '#8b5cf6' };
    return { label: 'public', color: '#0ea5e9' };
}

@Component({
    selector:        'feature-node',
    standalone:      true,
    imports:         [CommonModule],
    templateUrl:     './feature-node.component.html',
    styleUrls:       ['./feature-node.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureNodeComponent {
    @Input() feature!: FeatureData;
    @Input() depth    = 0;
    @Input() selected: FeatureData | null = null;
    @Input() onSelect!: (f: FeatureData) => void;

    open = true;

    get hasChildren(): boolean         { return !!this.feature.children?.length; }
    get isSelected():  boolean         { return this.selected?.id === this.feature.id; }
    get vis():         VisibilityBadge { return visibilityBadge(this.feature.visibility); }

    toggle(): void {
        if (this.onSelect) this.onSelect(this.feature);
        if (this.hasChildren) this.open = !this.open;
    }

    trackById(_: number, f: FeatureData): string { return f.id; }
}