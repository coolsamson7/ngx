import { Component, Directive, ElementRef, inject, Injectable, Injector, Input, OnInit, Self, ViewChild } from '@angular/core';
import { InjectionToken } from '@angular/core';

export const FORM_ENGINE = new InjectionToken<FormEngine>('FORM_ENGINE');

import { CommandToolbarComponent, WithCommandToolbar } from '@ngx/component';
import { Command, ViewComponent, WithCommands, WithView } from '@ngx/foundation';
import { AbstractFeature, Feature } from '@ngx/portal';
import { schema, object, string, boolean, number, optional, ShowErrorDirective, ValidateTypeDirective, RegisterValidationMessageHandler, AbstractValidationMessageHandler, Type, TypeViolation, ValidationError, ObjectType } from '@ngx/validation';
import { AbstractControl, FormControlDirective, ValidationErrors, ValidatorFn } from '@angular/forms';

import { FormBuilder, FormControl, FormGroup, NgControl, ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { get, set, StringBuilder } from '@ngx/common';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

interface User {
  name: string
  surname: string
  age: number
}

schema("user", object({
            name: string().max(10),
            surname: string().max(10),
            age: number().min(0).max(150),
        })
)


export function createTypeValidator(type: Type<any,any>): ValidatorFn {

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

/**
 * a handler for violations of type 'error' which will simply return the message property.
 */
@RegisterValidationMessageHandler('required')
@Injectable({providedIn: 'root'})
export class RequiredValidationMessageHandler extends AbstractValidationMessageHandler {
  // implement ValidationMessageHandler

  /**
   * @inheritdoc
   */
  computeMessage(violation: any, control: NgControl, host: ElementRef): string {
    const label = this.labelFor(control, host);

    return "field is required"
  }
}

@RegisterValidationMessageHandler('validateType')
@Injectable({providedIn: 'root'})
export class TypeValidationMessageHandler extends AbstractValidationMessageHandler {
  // implement ValidationMessageHandler

  /**
   * @inheritdoc
   */
  computeMessage(violation: any, control: NgControl, host: ElementRef): string {
    //const label = this.labelFor(control, host);

    const builder = new StringBuilder()
    

    const type = violation["type"] as Type<any,any>
    const violations = violation["violations"] as TypeViolation[]

    for (let violation of violations)
      builder.append(violation.name).append(" violated")

    return builder.toString()
  }
}

@Directive({
  selector: '[binding]',
  standalone: true
})
export class BindingDirective {
  private engine = inject(FORM_ENGINE);

  private _path!: string;

  @Input('binding')
  set path(value: string) {
    this._path = value;
    this.engine.register(value);
  }
}

export interface FormState<T = any> {
  value: T;
  dirty: boolean;
  valid: boolean;
}

export class FormEngine {
  form: FormGroup;

  private controls = new Map<string, FormControl>();

  private stateSubject = new BehaviorSubject<FormState>({
      value: {},
      dirty: false,
      valid: false
    });

    state$ = this.stateSubject.asObservable();

  constructor(
    private fb: FormBuilder,
    private type: Type<any, any>,
    private model: any
  ) {
    this.form = this.fb.group({});

    this.bindState();
  }

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

  register(path: string): FormControl {
    if (this.controls.has(path)) {
      return this.controls.get(path)!;
    }

    const control = new FormControl(
      get(this.model, path),
      this.buildValidators(path)
    );

    this.controls.set(path, control);

    const group = this.ensureGroup(path);
    const key = path.split('.').pop()!;
    group.addControl(key, control);

    return control;
  }

  private buildValidators(path: string) {
    return [
      createTypeValidator(
        (this.type as ObjectType).shape[path] as Type<any, any>
      )
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
      } else {
        current = current.get(key) as FormGroup;
      }
    }

    return current;
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
}

@Feature({
  id: "view-showcase",
  parent: "showcases",
  description: "view showcase",
  tags: ["showcase"],
  permissions: [],
  visibility: ["private", "public"],
  showcase: {
        title:       'View',
        description: 'A view showcase',
        group:       'Core',
        order:       1,
        docs:      'showcases/view/view-showcase.md',
        assets: [
          {
            type:    'ts',
            label:   'Source',
            path: 'showcases/view/view-showcase.component.ts',
          },
          {
            type:  'html',
            label: 'HTML',
            path:   'showcases/view/view-showcase.component.html',
          },
             {
            type:  'scss',
            label: 'SCSS',
            path:   'showcases/view/view-showcase.component.scss',
          },
        ]
      }
})
@Component({
    selector:        'view-showcase-page',
    standalone:      true,
    imports:         [CommandToolbarComponent, ViewComponent, ReactiveFormsModule, MatFormFieldModule, MatInputModule, ShowErrorDirective, BindingDirective],
  
    templateUrl:     './view-showcase.component.html',
    styleUrls:       ['./view-showcase.component.scss'],
     providers: [
        {
          provide: FORM_ENGINE,
          useFactory: (cmp: ViewShowcaseComponent) => cmp.formEngine,
          deps: [ViewShowcaseComponent]
        }
      ]
})
export class ViewShowcaseComponent extends WithView(WithCommandToolbar(WithCommands(AbstractFeature))) {
  // instance data

  formEngine! : FormEngine

  user: User = {
    name: "Andreas",
    surname: "Ernst",
    age: 42,
  }

  formState!: FormState<any>

  // constructor

  constructor(injector: Injector, public fb: FormBuilder) {
    super(injector);
    
    this.formEngine = new FormEngine(fb, Type.get("user")!, this.user)

    this.formEngine.hydrate()

    this.formEngine.state$.subscribe(state => {
      this.formState = state;

      console.log(state)
      this.updateCommandState();
    });
  }

  // override WithCommandToolbar

  updateCommandState() :void{
    /*this
      .setCommandEnabled("save", this.formState.dirty)
      .setCommandEnabled("revert", this.formState.dirty)*/
  }

  override buildToolbar() {
    this
      .addCommand2Toolbar("save")
      .addCommand2Toolbar("revert") 

    /*
        .addCommand2Toolbar("lockView", {menu: "more", icon: "help", tooltip: "Lock", label: "Lock" })
        .addCommand2Toolbar("lockCommand", {menu: "more", icon: "help", tooltip: "Lock", label: "Lock" })
        .addCommand2Toolbar("throwError", {group: "g1"})
        .addCommand2Toolbar("foo", {group: "g2"})*/
  }

  // NEW


  @Command({
    label: 'Save',
    icon: 'save',
    lock: "command"
   })
   async save() {
      this.formEngine.save()

      this.updateCommandState()
   }

   @Command({
    label: 'Revert',
    icon: 'forward',
    lock: "command"
   })
   async revert() {
      this.formEngine.hydrate()

      this.updateCommandState()
   }


  // NEW

  // commands

  @Command({
    label: 'Command',
    lock: "command"
   })
   async lockCommand() {
      await new Promise(resolve => setTimeout(resolve, 1000));
   }

   @Command({
     label: 'View',
     lock: "view"
   })
   async lockView() {
      await new Promise(resolve => setTimeout(resolve, 1000));
   }
   
   @Command({
      label: 'Foo',
      shortcut: "ctrl+f",
      icon: "help"
  })
  async foo() {
      console.log("foo")
  }

   @Command({
       label: 'Error',
       icon: "help"
   })
   async throwError() {
       throw new Error("ouch")
   }
}
