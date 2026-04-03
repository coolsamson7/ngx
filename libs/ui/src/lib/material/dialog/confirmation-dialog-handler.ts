import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { ConfirmationDialogRequest } from "../../ui/elements";
import { UIHandler } from "../../ui";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmationDialog } from "./confirmation-dialog";

export interface DialogListener {
  openDialog() : void
  closedDialog() : void
}

@Injectable()
export class ConfirmationDialogHandler implements UIHandler<ConfirmationDialogRequest> {
  type = ConfirmationDialogRequest;

  // instance data

  private listener: DialogListener[] = []

  // constructor

  constructor(private dialog : MatDialog) {}

  // public

  addListener(listener: DialogListener) {
    this.listener.push(listener)
  }

  // implement

  handle(req: ConfirmationDialogRequest): Observable<any> {
      return this.dialog.open(ConfirmationDialog,  { data: req.config })
            .afterClosed()
            .pipe(
              // call listener
              tap(() => this.listener.forEach(listener => listener.closedDialog()))
            )
  }
}