import { GConstructor, registerMixins } from "@ngx/common";
import { UIExecutor } from "../../ui-executor";
import { inject } from "@angular/core";
import { ConfirmationDialogBuilder, OpenDialogConfig, OpenDialogRequest } from "./confirmation-dialog-builder";
import { AbstractFeature } from "@ngx/portal";
import { Observable } from "rxjs";

export interface Dialogs {
  confirmationDialog() : ConfirmationDialogBuilder

  openDialog(dialog: OpenDialogConfig) : Observable<any>

  //inputDialog() : InputDialogBuilder
}

export function WithDialogs<T extends GConstructor<AbstractFeature>>(base: T) :GConstructor<Dialogs> &  T  {
    return registerMixins(class WithDialogsClass extends base implements Dialogs {
        // instance data

        private executor : UIExecutor

      // constructor

      constructor(...args: any[]) {
        super(...args);

        this.executor = inject(UIExecutor)
        }

        // implement Dialogs

        confirmationDialog() : ConfirmationDialogBuilder {
            return new ConfirmationDialogBuilder(this.executor)
        }

        openDialog(config: OpenDialogConfig)  : any{
            return this.executor.render(new OpenDialogRequest(config));
        }

        //inputDialog() : InputDialogBuilder {
        //    return this.dialogs.inputDialog()
        //}
    }, WithDialogs)
}