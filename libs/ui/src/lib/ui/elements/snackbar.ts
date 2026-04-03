import { UIRequest } from "../ui-request";


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