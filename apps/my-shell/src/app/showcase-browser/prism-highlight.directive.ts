import {
    Directive,
    ElementRef,
    Input,
    OnChanges,
    AfterViewInit,
} from '@angular/core';

import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-json';

// ── IMPORTANT: import a Prism theme globally or add to angular.json styles ──
// Option A — import here (bundled into component):
// import 'prismjs/themes/prism-tomorrow.css';
//
// Option B (recommended) — add to angular.json styles array:
// "node_modules/prismjs/themes/prism-tomorrow.css"

@Directive({
    selector:   'code[prismHighlight]',  // only matches <code> elements
    standalone: true,
})
export class PrismHighlightDirective implements OnChanges, AfterViewInit {

    @Input() prismHighlight = '';
    @Input() language       = 'typescript';

    private initialized = false;

    constructor(private el: ElementRef<HTMLElement>) {}

    ngAfterViewInit(): void {
        this.initialized = true;
        this.highlight();
    }

    ngOnChanges(): void {
        if (this.initialized) this.highlight();
    }

    private highlight(): void {
        const el   = this.el.nativeElement;
        const code = this.prismHighlight;

        if (!el || !code) return;

        // set raw text first — Prism will replace innerHTML
        el.textContent = code;
        el.className   = `language-${this.language}`;

        // Prism.highlightElement works on <code> elements directly
        Prism.highlightElement(el);
    }
}