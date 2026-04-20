import { Directive, inject, Input, InjectionToken } from '@angular/core';
import { AbstractControl, FormControlName, ValidationErrors, ValidatorFn, FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { BehaviorSubject, combineLatest, map } from 'rxjs';

import { get, set } from '@ngx/common';
import { ObjectType, ReferenceType, Type } from '@ngx/validation';

// token

export const FORM_ENGINE = new InjectionToken<FormMapper<any>>('FORM_ENGINE');

export type PathOf<T> =
  T extends object
    ? {
        [K in keyof T & string]:
          T[K] extends readonly any[]
            ? never
            : T[K] extends object
              ? `${K}` | `${K}.${PathOf<T[K]>}`
              : `${K}`;
      }[keyof T & string]
    : never;

export type BindingProxy<T> = {
  readonly __path: string
} & {
  [K in keyof T & string]: T[K] extends object ? BindingProxy<T[K]> : BindingProxy<any>
}

export function createBindings<T extends object>(path = ''): BindingProxy<T> {
  return new Proxy({} as any, {
    get: (_target, prop: string) => {
      if (prop === '__path') return path;
      const next = path ? `${path}.${prop}` : prop;
      return createBindings(next);
    }
  }) as BindingProxy<T>;
}

export type BindingValue = BindingProxy<any> | string;

@Directive({ selector: '[binding]', standalone: true })
export class BindingDirective {
  // properties

  private engine = inject(FORM_ENGINE);
  private fcn = inject(FormControlName, { self: true });

  // input

  @Input('binding')
  set binding(value: BindingValue) {
    const path = typeof value === 'string' ? value : value.__path;
    this.fcn.name = path;
    this.engine.register(path);
  }
}

export interface FormState<T = any> {
  value: Partial<T>;
  dirty: boolean;
  valid: boolean;
}

export class FormMapper<T> {
  // properties

  form: FormGroup;

  private controls = new Map<string, FormControl>();

  private stateSubject = new BehaviorSubject<FormState<T>>({
      value: {},
      dirty: false,
      valid: false
    });

    state$ = this.stateSubject.asObservable();

  // constructor

  constructor(private fb: FormBuilder, private type: Type<any, any>, private model: any) {
    this.form = this.fb.group({});

    this.bindState();
  }

  // public

  register(path: string): FormControl {
    if (this.controls.has(path))
      return this.controls.get(path)!;

    const control = new FormControl(
      get(this.model, path),
      this.buildValidators(path)
    );

    this.controls.set(path, control);
    this.form.addControl(path, control); // flat key 'address.city' on root group

    return control;
  }

  hydrate() {
    for (const [path, control] of this.controls) {
      control.setValue(get(this.model, path), { emitEvent: false });
    }
  }

  save() {
    for (const [path, control] of this.controls) {
      set(this.model, path, control.value);
    }
  }

  isDirty(): boolean {
    for (const [path, control] of this.controls) {
      if (control.value !== get(this.model, path)) {
        return true;
      }
    }
    return false;
  }

  // private

  private bindState() {
      combineLatest([
        this.form.valueChanges,
        this.form.statusChanges
      ])
      .pipe(
        map(() => ({
          value: this.form.getRawValue(),
          dirty: this.isDirty(),
          valid: this.form.valid
        }))
      )
      .subscribe(state => {
        this.stateSubject.next(state);
      });
    }

  private createTypeValidator(type: Type<any,any>): ValidatorFn {
     return (control: AbstractControl): ValidationErrors | null => {
       const value = control.value

       try {
         type.validate(value)

         return null
       }
       catch(error: any) {
         return {
           validateType: {
             type,
             violations: error.violations
           }
         }
       }
     };
   }

   private resolveType(path: string): Type<any, any> {
     const parts = path.split('.');
     let type = this.type as ObjectType;

     for (let i = 0; i < parts.length - 1; i++) {
       type = type.shape[parts[i]] as ObjectType;
       if ( type instanceof ReferenceType)
          type = (type as ReferenceType<any>).schema
     }

     return type.shape[parts[parts.length - 1]] as Type<any, any>;
   }

  private buildValidators(path: string) {
    return [
      this.createTypeValidator(this.resolveType(path))
    ];
  }

  private ensureGroup(path: string): FormGroup {
    const parts = path.split('.');
    let current = this.form;

    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];

      if (!current.get(key)) {
        const group = this.fb.group({});
        current.addControl(key, group);
        current = group;
      }
      else {
        current = current.get(key) as FormGroup;
      }
    }

    return current;
  }
}