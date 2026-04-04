import {
  Directive,
  ViewChild,
  ViewContainerRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ComponentRef,
  Type,
  Inject,
  EventEmitter
} from '@angular/core';
import { COMPONENT_REGISTRY } from './component-registry';

function getComponentDef(type: any) {
  return type.ɵcmp;
}

function getInputs(type: any): string[] {
  return Object.keys(getComponentDef(type)?.inputs || {});
}

function getOutputs(type: any): string[] {
  return Object.keys(getComponentDef(type)?.outputs || {});
}

@Directive()
export abstract class DelegatingComponent<T>
  implements AfterViewInit, OnChanges {

  @ViewChild('vc', { read: ViewContainerRef, static: true })
  vc!: ViewContainerRef;

  protected ref!: ComponentRef<T>;
  protected implType!: Type<T>;

  constructor(
    @Inject(COMPONENT_REGISTRY) private registry: Record<string, Type<any>>
  ) {}

  /** key used in registry (e.g. "button") */
  protected abstract key(): string;

  /** fallback if nothing configured */
  protected abstract fallback(): Type<T>;

  ngAfterViewInit() {
    this.implType = this.registry[this.key()] ?? this.fallback();

    this.ref = this.vc.createComponent(this.implType);

    this.bindOutputs();
    this.updateInputs();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.ref) return;
    this.updateInputs(changes);
  }

  // -------------------------
  // Input forwarding
  // -------------------------

  private updateInputs(changes?: SimpleChanges) {
    const inputs = getInputs(this.implType);

    for (const input of inputs) {
      if ((this as any)[input] !== undefined) {
        (this.ref.instance as any)[input] = (this as any)[input];
      }
    }
  }

  // -------------------------
  // Output forwarding
  // -------------------------

  private bindOutputs() {
    const outputs = getOutputs(this.implType);
    const instance: any = this.ref.instance;

    for (const output of outputs) {
      const childEmitter = instance[output];
      const parentEmitter = (this as any)[output];

      if (
        childEmitter instanceof EventEmitter &&
        parentEmitter instanceof EventEmitter
      ) {
        childEmitter.subscribe((value: any) => {
          parentEmitter.emit(value);
        });
      }
    }
  }
}