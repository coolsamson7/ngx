import {
    Component,
    Input,
    inject,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureRegistry, FeatureData, Feature } from '@ngx/portal';
import { FeatureNodeComponent } from './feature-node.component';
import { FeatureDetailPanelComponent } from './feature-detail.component';

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

interface VisibilityBadge { label: string; color: string; }

function visibilityBadge(vis: string[] = ['public']): VisibilityBadge {
    if (vis.includes('public') && vis.includes('private'))
        return { label: 'public + private', color: '#10b981' };
    if (vis.includes('private'))
        return { label: 'private', color: '#8b5cf6' };
    return { label: 'public', color: '#0ea5e9' };
}

// ---------------------------------------------------------------------------
// InspectorPage
// ---------------------------------------------------------------------------

@Feature({
  id: 'feature-browser',
  label: 'Feature Browser',
  tags: ['navigation'],
  visibility: ['public', 'private'],
})
@Component({
    selector:        'inspector-page',
    standalone:      true,
    imports:         [CommonModule, FeatureNodeComponent, FeatureDetailPanelComponent],
    templateUrl:     './feature-browser.component.html',
    styleUrls:       ['./feature-browser.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspectorPageComponent {
    private featureRegistry = inject(FeatureRegistry);
    private cdr             = inject(ChangeDetectorRef);

    selected: FeatureData | null = null;

    get roots(): FeatureData[] {
        return this.featureRegistry.finder().withoutParent().find();
    }

    selectFn = (f: FeatureData): void => {
        this.selected = this.selected?.id === f.id ? null : f;
        this.cdr.markForCheck();
    };

    trackById(_: number, f: FeatureData): string { return f.id; }
}