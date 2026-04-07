import {
    Component,
    Input,
    ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import type { FeatureData } from '@ngx/portal';

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

    get hasChildren(): boolean  { return !!this.feature.children?.length; }
    get isSelected():  boolean  { return this.selected?.id === this.feature.id; }
    get visibilities(): string[] { return this.feature.visibility ?? []; }

    toggle(): void {
        if (this.onSelect) this.onSelect(this.feature);
        if (this.hasChildren) this.open = !this.open;
    }

    trackById(_: number, f: FeatureData): string { return f.id; }
}