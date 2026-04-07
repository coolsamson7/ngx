import { GConstructor, registerMixins } from "@ngx/common";
import { inject } from "@angular/core";
import { AbstractFeature } from "@ngx/portal";
import { Translator } from "@ngx/i18n";

export interface I18N {
  translate(key : string, options?: any) : string
}

export function WithI18N<T extends GConstructor<AbstractFeature>>(base: T) :GConstructor<I18N> &  T  {
    return registerMixins(class WithI18NClass extends base implements I18N {
        // instance data

        private translator : Translator

        // constructor

        constructor(...args: any[]) {
          super(...args);

          this.translator = inject(Translator)
        }

        // implement I18N

        translate(key : string, options?: any) : string {
            return this.translator.translate(key, options);
        }
    }, WithI18N)
}