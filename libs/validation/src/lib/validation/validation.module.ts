import { NgModule, Injector } from "@angular/core";
import { ReplaySubject } from "rxjs";

// force loading

export * from './handler/error-validation-message-handler';

@NgModule({
    imports: []
  })
  export class ValidationModule {
    static injector = new ReplaySubject<Injector>(1);

    static forRoot() {
      return {
        ngModule: ValidationModule,
        providers: []
      };
    }

    constructor(injector: Injector) {
        ValidationModule.injector.next(injector);
    }
  }
