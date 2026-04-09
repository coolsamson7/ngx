import { Component, ElementRef, Input, AfterViewInit, OnDestroy, NgZone, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'ngx-splitter',
  templateUrl: './splitter.component.html',
  styleUrls: ['./splitter.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None  // ✅ fixes injected handle not getting styles
})
export class SplitterComponent implements AfterViewInit, OnDestroy {
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() initialRatio = 0.5;
  @Input() min = 0.1;
  @Input() max = 0.9;

  private dragging = false;
  private handleEl!: HTMLElement;
  private observer!: MutationObserver;

  constructor(private el: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngAfterViewInit(): void {
    const host = this.el.nativeElement;
    host.style.setProperty('--split', this.initialRatio.toString());
    host.classList.toggle('vertical', this.orientation === 'vertical');

    this.handleEl = document.createElement('div');
    this.handleEl.className = 'ngx-splitter-handle';
    this.handleEl.innerHTML = `<span class="ngx-splitter-grip"></span>`;
    this.handleEl.addEventListener('mousedown', (e) => this.startDrag(e));

    this.updateLayout();

    this.observer = new MutationObserver(() => this.updateLayout());
    this.observer.observe(host, { childList: true });

    this.zone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.onDrag);
      window.addEventListener('mouseup', this.stopDrag);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    window.removeEventListener('mousemove', this.onDrag);
    window.removeEventListener('mouseup', this.stopDrag);
  }

  private updateLayout(): void {
    const host = this.el.nativeElement;
    const panes = Array.from(host.children).filter(c => c !== this.handleEl);
    const hasBoth = panes.length >= 2;

    if (hasBoth && !host.contains(this.handleEl)) {
      panes[0].after(this.handleEl);
    } else if (!hasBoth && host.contains(this.handleEl)) {
      this.handleEl.remove();
    }
  }

  private startDrag(e: MouseEvent): void {
    e.preventDefault();
    this.dragging = true;

    this.el.nativeElement.classList.add('dragging'); // ✅ add
  }

  stopDrag = (): void => {
    this.dragging = false;

    this.el.nativeElement.classList.remove('dragging'); // ✅ remove
  };

  onDrag = (e: MouseEvent): void => {
    if (!this.dragging) return;
    const rect = this.el.nativeElement.getBoundingClientRect();
    let ratio = this.orientation === 'horizontal'
      ? (e.clientX - rect.left) / rect.width
      : (e.clientY - rect.top) / rect.height;
    ratio = Math.max(this.min, Math.min(this.max, ratio));
    this.el.nativeElement.style.setProperty('--split', ratio.toString());
  };
}