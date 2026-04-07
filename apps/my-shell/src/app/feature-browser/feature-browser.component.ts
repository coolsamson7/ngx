import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { FeatureRegistry, FeatureData, Feature, AbstractFeature } from '@ngx/portal';
import { FeatureNodeComponent } from './feature-node.component';
import { FeatureDetailPanelComponent } from './feature-detail.component';

@Feature({
  id: 'feature-browser',
  label: 'Feature Browser',
  tags: ['navigation'],
  visibility: ['public', 'private'],
})
@Component({
    selector:        'inspector-page',
    standalone:      true,
    imports:         [CommonModule, FeatureNodeComponent, FeatureDetailPanelComponent, MatDividerModule],
    templateUrl:     './feature-browser.component.html',
    styleUrls:       ['./feature-browser.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspectorPageComponent extends AbstractFeature {
    private featureRegistry = inject(FeatureRegistry);
    private cdr             = inject(ChangeDetectorRef);

    selected: FeatureData | null = null;
    sidebarWidth = 350;
    private isResizing = false;

    get roots(): FeatureData[] {
        return this.featureRegistry.finder().withoutParent().find();
    }

    selectFn = (f: FeatureData): void => {
        this.selected = f;
        this.cdr.markForCheck();
    };

    startResizing(event: MouseEvent): void {
        this.isResizing = true;
        document.body.style.cursor = 'col-resize';
        event.preventDefault();
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (!this.isResizing) return;
        this.sidebarWidth = Math.max(200, Math.min(800, event.clientX));
        this.cdr.markForCheck();
    }

    @HostListener('window:mouseup')
    onMouseUp(): void {
        if (this.isResizing) {
            this.isResizing = false;
            document.body.style.cursor = 'default';
        }
    }

    trackById(_: number, f: FeatureData): string { return f.id; }
}