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

export type ActiveTab = 'preview' | 'docs' | number;
export type ViewMode  = 'preview' | 'split' | 'code';

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
    showcases: any[] = [];
    selectedId?: string;
    selectedShowcase?: any;
    assets: ShowcaseAsset[] = [];
    docs?: string;
    hasDocs = false;
    selectedLabel = '';
    selectedDescription?: string;
    activeAssetIndex: number | null = null;
    activeAsset: ShowcaseAsset | null = null;
    showPreview = true;
    showDocs = false;
    showCode = true;
    bodyClass = 'sc-body';
    noSource = false;
    view: ViewMode = 'split';
    activeTab: ActiveTab = 'preview';
    urlContents: Record<number, string> = {};
    copiedIndex: number | null = null;

    constructor(injector: Injector, registry: ShowcaseRegistry) {
        super(injector);
        registry.startup();
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.showcases = this.featureRegistry.finder().withTag('showcase').find();
        this.updateSelected(this.router.url);

        this.routerSub = this.router.events
            .pipe(filter(e => e instanceof NavigationEnd))
            .subscribe((event: any) => {
                this.activeTab   = 'preview';
                this.urlContents = {};
                this.updateSelected(event.urlAfterRedirects || event.url);
                this.loadUrlAssets();
                this.cdr.markForCheck();
            });

        this.loadUrlAssets();
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.routerSub?.unsubscribe();
    }

    private updateSelected(url: string) {
        this.selectedId = url.slice(1).replace("/", '.');

        this.selectedShowcase = this.showcases.find(s => s.path === this.selectedId);

        if (this.selectedShowcase) {
            this.assets = this.showcaseRegistry.getAssets(this.selectedShowcase.path, this.featureRegistry);
            this.docs = this.showcaseRegistry.getDocs(this.selectedShowcase.path, this.featureRegistry);
            this.hasDocs = !!this.docs;
            this.selectedLabel = this.selectedShowcase.showcase?.title
                || this.selectedShowcase.label
                || this.selectedShowcase.id
                || '';
            this.selectedDescription = this.selectedShowcase.showcase?.description;

            this.activeAssetIndex = (typeof this.activeTab === 'number')
                ? this.activeTab
                : this.assets.length > 0 ? 0 : null;
            this.activeAsset = this.activeAssetIndex !== null ? this.assets[this.activeAssetIndex] : null;

            this.showPreview = (this.activeTab === 'preview' || typeof this.activeTab === 'number')
                && (this.view === 'split' || this.view === 'preview');
            this.showCode = !!this.activeAsset && this.activeTab !== 'docs'
                && (this.view === 'split' || this.view === 'code');
            this.showDocs = this.activeTab === 'docs' && this.hasDocs;

            this.bodyClass = this.view === 'code' && !this.showDocs ? 'sc-body code-only' : 'sc-body';
            this.noSource = !this.showDocs && (this.view === 'split' || this.view === 'code') && !this.activeAsset;
        }
    }

    private loadUrlAssets(): void {
        this.assets.forEach((asset, i) => {
            if (asset.url && this.urlContents[i] === undefined) {
                fetch("/assets/showcases/" + asset.url)
                    .then(r => r.text())
                    .then(text => {
                        this.urlContents[i] = text;
                        this.cdr.markForCheck();
                    })
                    .catch(() => {
                        this.urlContents[i] = `// failed to load assets/${asset.url}`;
                        this.cdr.markForCheck();
                    });
            }
        });
    }

    getAssetContent(asset: ShowcaseAsset, index: number): string {
        if (asset.content) return asset.content;
        if (asset.url) return this.urlContents[index] ?? 'Loading…';
        return '';
    }

    navigate(path: string): void {
        this.router.navigate(path.split('.'));
    }

    setView(view: ViewMode): void {
        this.view = view;
        this.updateSelected(this.router.url);
        this.cdr.markForCheck();
    }

    setActiveTab(tab: ActiveTab): void {
        this.activeTab = tab;
        this.updateSelected(this.router.url);
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