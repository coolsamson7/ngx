import {
    Component,
    inject,
    OnInit,
    OnDestroy,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Injector
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AbstractFeature, Feature, FeatureRegistry } from '@ngx/portal';
import { ShowcaseRegistry } from './showcase-registry';
import type { ShowcaseAsset } from '@ngx/portal';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ActiveTab = 'preview' | 'docs' | number;
export type ViewMode  = 'preview' | 'split' | 'code';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

@Feature({
  id: 'showcases',
  label: 'Showcases',
  tags: ['navigation'],
  visibility: ['public', 'private']
})
@Component({
    selector:        'showcase-page',
    standalone:      true,
    imports:         [CommonModule, RouterModule, RouterOutlet],
    templateUrl:     './showcase.component.html',
    styleUrls:       ['./showcase.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcasePageComponent extends AbstractFeature implements OnInit, OnDestroy {

    private featureRegistry  = inject(FeatureRegistry);
    private showcaseRegistry = inject(ShowcaseRegistry);
    private router           = inject(Router);
    private cdr              = inject(ChangeDetectorRef);

    private routerSub?: Subscription;

    // ── state ──

    view:       ViewMode  = 'split';
    activeTab:  ActiveTab = 'preview';
    urlContents: Record<number, string> = {};


    constructor(injector: Injector) {
        super(injector);
    }
    

    // ── derived ──

    get showcases() {
        return this.featureRegistry.finder().withTag('showcase').find();
    }

    get selectedId(): string | undefined {
        const segments = this.router.url.split('/');
        return segments[2] || undefined;
    }

    get selectedShowcase() {
        return this.showcases.find(s => s.path === this.selectedId);
    }

    get assets(): ShowcaseAsset[] {
        if (!this.selectedShowcase) return [];
        return this.showcaseRegistry.getAssets(this.selectedShowcase.id, this.featureRegistry);
    }

    get docs(): string | undefined {
        if (!this.selectedShowcase) return undefined;
        return this.showcaseRegistry.getDocs(this.selectedShowcase.id, this.featureRegistry);
    }

    get hasDocs(): boolean { return !!this.docs; }

    get selectedLabel(): string {
        return this.selectedShowcase?.showcase?.title
            || this.selectedShowcase?.label
            || this.selectedShowcase?.id
            || '';
    }

    get selectedDescription(): string | undefined {
        return this.selectedShowcase?.showcase?.description;
    }

    get activeAssetIndex(): number | null {
        if (typeof this.activeTab === 'number') return this.activeTab;
        return this.assets.length > 0 ? 0 : null;
    }

    get activeAsset(): ShowcaseAsset | null {
        return this.activeAssetIndex !== null ? this.assets[this.activeAssetIndex] : null;
    }

    get showPreview(): boolean {
        return (this.activeTab === 'preview' || typeof this.activeTab === 'number')
            && (this.view === 'split' || this.view === 'preview');
    }

    get showCode(): boolean {
        return !!this.activeAsset
            && this.activeTab !== 'docs'
            && (this.view === 'split' || this.view === 'code');
    }

    get showDocs(): boolean {
        return this.activeTab === 'docs' && this.hasDocs;
    }

    get bodyClass(): string {
        return this.view === 'code' && !this.showDocs ? 'sc-body code-only' : 'sc-body';
    }

    get noSource(): boolean {
        return !this.showDocs && (this.view === 'split' || this.view === 'code') && !this.activeAsset;
    }

    // ── lifecycle ──

    override ngOnInit(): void {
        super.ngOnInit();

        this.routerSub = this.router.events
            .pipe(filter(e => e instanceof NavigationEnd))
            .subscribe(() => {
                this.activeTab   = 'preview';
                this.urlContents = {};
                this.loadUrlAssets();
                this.cdr.markForCheck();
            });

        this.loadUrlAssets();
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routerSub?.unsubscribe();
    }

    // ── asset loading ──

    private loadUrlAssets(): void {
        this.assets.forEach((asset, i) => {
            if (asset.url && this.urlContents[i] === undefined) {
                fetch(asset.url)
                    .then(r => r.text())
                    .then(text => {
                        this.urlContents = { ...this.urlContents, [i]: text };
                        this.cdr.markForCheck();
                    })
                    .catch(() => {
                        this.urlContents = { ...this.urlContents, [i]: `// failed to load ${asset.url}` };
                        this.cdr.markForCheck();
                    });
            }
        });
    }

    getAssetContent(asset: ShowcaseAsset, index: number): string {
        if (asset.content) return asset.content;
        if (asset.url)     return this.urlContents[index] ?? 'Loading…';
        return '';
    }

    // ── interactions ──

    navigate(path: string): void {
        this.router.navigate(path.split('.'));
    }

    setView(view: ViewMode): void {
        this.view = view;
        this.cdr.markForCheck();
    }

    setActiveTab(tab: ActiveTab): void {
        this.activeTab = tab;
        this.cdr.markForCheck();
    }

    isTabActive(tab: ActiveTab): boolean {
        return this.activeTab === tab;
    }

    normalizeLang(type: string): string {
        return type === 'md' ? 'markdown' : type;
    }

    trackByIndex(i: number): number { return i; }
    trackById(_: number, s: any): string { return s.id; }

    // ── copy ──

    copiedIndex: number | null = null;

    copyContent(content: string, index: number): void {
        navigator.clipboard.writeText(content).then(() => {
            this.copiedIndex = index;
            this.cdr.markForCheck();
            setTimeout(() => {
                this.copiedIndex = null;
                this.cdr.markForCheck();
            }, 2000);
        });
    }
}