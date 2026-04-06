import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnChanges,
    ViewChild,
    ElementRef,
    AfterViewChecked,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    inject,
    Pipe,
    PipeTransform
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TraceLevel, StackFrame, Trace, TraceFormatter } from '@ngx/common';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export class TraceEntry {
    path:       string;
    level:      TraceLevel;
    message:    string;
    timestamp:  Date;
    stackFrame: StackFrame;

    constructor(path: string, level: TraceLevel, message: string, timestamp: Date, stackFrame: StackFrame) {
        this.path       = path;
        this.level      = level;
        this.message    = message;
        this.timestamp  = timestamp;
        this.stackFrame = stackFrame;
    }
}

export interface LevelMeta {
    label: string;
    color: string;
    bg:    string;
    dot:   string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const LEVEL_META: Record<TraceLevel, LevelMeta> = {
    [TraceLevel.OFF]:    { label: 'OFF',  color: '#6b7280', bg: 'rgba(107,114,128,0.08)', dot: '#6b7280' },
    [TraceLevel.LOW]:    { label: 'LOW',  color: '#34d399', bg: 'rgba(52,211,153,0.08)',  dot: '#34d399' },
    [TraceLevel.MEDIUM]: { label: 'MED',  color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  dot: '#fbbf24' },
    [TraceLevel.HIGH]:   { label: 'HIGH', color: '#f87171', bg: 'rgba(248,113,113,0.08)', dot: '#f87171' },
    [TraceLevel.FULL]:   { label: 'FULL', color: '#e879f9', bg: 'rgba(232,121,249,0.08)', dot: '#e879f9' },
};

export const TRACE_LEVELS: TraceLevel[] = Object.values(TraceLevel)
    .filter((v): v is TraceLevel => typeof v === 'number') as TraceLevel[];

@Pipe({ name: 'pathList', standalone: true, pure: false })
export class PathListPipe implements PipeTransform {
    transform(entries: TraceEntry[]): string[] {
        return [...new Set(entries.map(e => e.path))].sort();
    }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

@Component({
    selector:        'trace-footer',
    standalone:      true,
    imports:         [CommonModule, FormsModule, PathListPipe],
    templateUrl:     './trace.component.html',
    styleUrls:       ['./trace.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TraceFooterComponent implements OnChanges, AfterViewChecked {

    @Input() entries:    TraceEntry[] = [];
    @Input() maxEntries: number       = 200;
    @Output() cleared = new EventEmitter<void>();

    @ViewChild('listEl') listEl?: ElementRef<HTMLDivElement>;

    private cdr = inject(ChangeDetectorRef);

    // ── state ──

    open          = false;
    height        = 320;
    filterLevel:  TraceLevel | null = null;
    filterPath    = '';
    selectedEntry: TraceEntry | null = null;
    autoScroll    = true;
    isDragging    = false;

    // ── drag state ──

    private dragStartY = 0;
    private dragStartH = 0;
    private boundMove!: (e: MouseEvent) => void;
    private boundUp!:   (e: MouseEvent) => void;

    // ── exposed constants for template ──

    readonly levelMeta  = LEVEL_META;
    readonly traceLevels = TRACE_LEVELS;

    // ── lifecycle ──

    ngOnChanges(): void {
        this.cdr.markForCheck();
    }

    ngAfterViewChecked(): void {
        if (this.autoScroll && this.open && this.listEl) {
            const el = this.listEl.nativeElement;
            el.scrollTop = el.scrollHeight;
        }
    }

    // ── computed ──

    get visible(): TraceEntry[] {
        return this.entries
            .slice(-this.maxEntries)
            .filter(e => {
                if (this.filterLevel !== null && e.level !== this.filterLevel) return false;
                if (this.filterPath && !e.path.toLowerCase().includes(this.filterPath.toLowerCase())) return false;
                return true;
            });
    }

    get lastEntry(): TraceEntry | null {
        return this.entries.length ? this.entries[this.entries.length - 1] : null;
    }

    get lastDot(): string {
        return this.lastEntry ? LEVEL_META[this.lastEntry.level].dot : '#484f58';
    }

    get lastDotShadow(): string {
        return this.lastEntry ? `0 0 5px ${LEVEL_META[this.lastEntry.level].dot}` : 'none';
    }

    get panelHeight(): string {
        return this.open ? `${this.height}px` : '0';
    }

    get tabBottom(): string {
        return this.open ? `${this.height}px` : '0';
    }

    countForLevel(level: TraceLevel): number {
        return this.entries.filter(e => e.level === level).length;
    }

    stackFrameEntries(entry: TraceEntry): [string, unknown][] {
        return Object.entries(entry.stackFrame) as [string, unknown][];
    }

    // ── interactions ──

    toggleOpen(): void {
        this.open = !this.open;
        this.cdr.markForCheck();
    }

    toggleFilterLevel(level: TraceLevel): void {
        this.filterLevel = this.filterLevel === level ? null : level;
        this.cdr.markForCheck();
    }

    toggleAutoScroll(): void {
        this.autoScroll = !this.autoScroll;
        this.cdr.markForCheck();
    }

    selectEntry(entry: TraceEntry): void {
        this.selectedEntry = this.selectedEntry === entry ? null : entry;
        this.cdr.markForCheck();
    }

    clearSelected(): void {
        this.selectedEntry = null;
        this.cdr.markForCheck();
    }

    onClear(): void {
        this.cleared.emit();
    }

    onListScroll(event: Event): void {
        const el = event.currentTarget as HTMLDivElement;
        this.autoScroll = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
        this.cdr.markForCheck();
    }

    // ── drag to resize ──

    onDragStart(event: MouseEvent): void {
        event.preventDefault();
        this.isDragging  = true;
        this.dragStartY  = event.clientY;
        this.dragStartH  = this.height;

        this.boundMove = (e: MouseEvent) => this.onDragMove(e);
        this.boundUp   = ()              => this.onDragEnd();

        window.addEventListener('mousemove', this.boundMove);
        window.addEventListener('mouseup',   this.boundUp);
    }

    private onDragMove(e: MouseEvent): void {
        const delta  = this.dragStartY - e.clientY;
        this.height  = Math.max(140, Math.min(window.innerHeight * 0.8, this.dragStartH + delta));
        this.cdr.markForCheck();
    }

    private onDragEnd(): void {
        this.isDragging = false;
        window.removeEventListener('mousemove', this.boundMove);
        window.removeEventListener('mouseup',   this.boundUp);
        this.cdr.markForCheck();
    }

    // ── formatting ──

    formatTime(date: Date): string {
        return date.toLocaleTimeString('en-US', {
            hour12:                  false,
            hour:                    '2-digit',
            minute:                  '2-digit',
            second:                  '2-digit',
            fractionalSecondDigits:  3,
        } as Intl.DateTimeFormatOptions);
    }

    trackByIndex(i: number): number { return i; }
}