import { GConstructor, registerMixins } from "@ngx/common";
import { UIExecutor } from "../../ui-executor";
import { inject } from "@angular/core";
import { ConfirmationDialogBuilder } from "./confirmation-dialog-builder";
import { AbstractFeature } from "@ngx/portal";

export interface Dialogs {
  //openDialog<T>(component: ComponentType<T>, configuration: any) : Observable<any>

  confirmationDialog() : ConfirmationDialogBuilder

  //inputDialog() : InputDialogBuilder

  //dynamicDialog() : DynamicDialogBuilder
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

        // implement OnLocalChange

        //openDialog<T>(component: ComponentType<T>, configuration: any) : Observable<any> {
        //    return this.dialogs.openDialog(component, configuration)
        //}

        confirmationDialog() : ConfirmationDialogBuilder {
            return new ConfirmationDialogBuilder(this.executor)
        }

        //dynamicDialog() : DynamicDialogBuilder {
        //    return this.dialogs.dynamicDialog()
        //}

        //inputDialog() : InputDialogBuilder {
        //    return this.dialogs.inputDialog()
        //}
    }, WithDialogs)
}