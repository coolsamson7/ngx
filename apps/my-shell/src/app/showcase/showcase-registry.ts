import { Injectable, inject } from '@angular/core';
import { FeatureRegistry } from '@ngx/portal';
import type { ShowcaseAsset } from '@ngx/portal';

@Injectable({ providedIn: 'root' })
export class ShowcaseRegistry {
    private featureRegistry = inject(FeatureRegistry);

    async startup(): Promise<void> {
        const showcases = this.featureRegistry.finder().withTag('showcase').find();

        for (const showcase of showcases) {
            // load docs
            if (showcase.showcase?.docs) {
                const content = await this.loadFile(showcase.showcase.docs);
                if (content && showcase.showcase) showcase.showcase.docs = content;
            }

            // load path-based assets
            if (showcase.showcase?.assets) {
                for (const asset of showcase.showcase.assets) {
                    if (asset.path && !asset.content && !asset.url) {
                        asset.content = await this.loadFile(asset.path) ?? '';
                    }
                }
            }
        }
    }

    private async loadFile(filename: string): Promise<string | undefined> {
        try {
            const mod = await import(`./showcases/${filename}?raw`);
            return mod.default ?? mod;
        } catch {
            return undefined;
        }
    }

    private async loadSourceFile(manifestPath: string): Promise<string | undefined> {
        try {
            const prefix = 'src/showcases/';
            const idx    = manifestPath.indexOf(prefix);
            if (idx === -1) return undefined;
            const filename = manifestPath.slice(idx + prefix.length);
            return this.loadFile(filename);
        } catch {
            return undefined;
        }
    }

    getAssets(featureId: string, featureRegistry: FeatureRegistry): ShowcaseAsset[] {
        try {
            return featureRegistry.getFeature(featureId)?.showcase?.assets ?? [];
        } catch {
            return [];
        }
    }

    getDocs(featureId: string, featureRegistry: FeatureRegistry): string | undefined {
        try {
            return featureRegistry.getFeature(featureId)?.showcase?.docs;
        } catch {
            return undefined;
        }
    }
}