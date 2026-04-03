import { GConstructor, registerMixins } from "@ngx/common";
import { AbstractFeature } from "@ngx/portal";

import { UIRequest } from "../ui-request";
import { UIExecutor } from "../ui-executor";

export interface SnackbarOptions {
  duration?: number;        // how long it stays visible (ms)
  action?: string;          // button text (e.g. "Undo")
  panelClass?: string | string[]; // styling hook
  horizontalPosition?: 'start' | 'center' | 'end' | 'left' | 'right';
  verticalPosition?: 'top' | 'bottom';
}

export class SnackbarRequest implements UIRequest<void> {
  constructor(
    public readonly message: string,
    public readonly options?: SnackbarOptions
  ) {}
}

export interface WithSnackbar {
    showSnackbar(message: string, options?: SnackbarOptions) : void;
}

export function WithSnackbar<T extends GConstructor<AbstractFeature>>(base: T) :T & GConstructor<WithSnackbar> {
    return registerMixins(class WithSnackbarClass extends base implements WithSnackbar {
        // constructor

        constructor(...args: any[]) {
            super(...args);
        }

        // implement WithSnackbar

        showSnackbar(message: string, options?: SnackbarOptions) : void {
            this.injector.get(UIExecutor).render(new SnackbarRequest(message, options))
        }
    }, WithSnackbar)
}
