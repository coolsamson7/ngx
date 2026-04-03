import { Injectable } from "@angular/core";
import { OpenDialogRequest, UIHandler } from "../../ui";
import { MatDialog } from "@angular/material/dialog";
import { FeatureDialogComponent } from "./feature-dialog";
import { tap } from "rxjs";

@Injectable()
export class OpenDialogHandler implements UIHandler<OpenDialogRequest> {
  type = OpenDialogRequest;

  constructor(private dialog : MatDialog) {}

  handle(req: OpenDialogRequest): any {
     return this.dialog.open(FeatureDialogComponent,  { data: req.config })
                .afterClosed()
                .pipe(
                  // call listener
                  //tap(() => this.listener.forEach(listener => listener.closedDialog()))
                )
  }
}