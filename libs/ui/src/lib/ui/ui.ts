import { Type } from '@angular/core';



  import { Inject, Injector } from '@angular/core';

  import { Inject, Injector, Type } from '@angular/core';



  export class UIService {
    constructor(private renderer: UIRenderer) {}

    snackbar(message: string, options?: SnackbarOptions) {
      return this.renderer.render(
        new SnackbarRequest(message, options)
      );
      // → void
    }

  }