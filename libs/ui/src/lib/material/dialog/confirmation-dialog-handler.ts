import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { ConfirmationDialogRequest } from "../../ui/elements";
import { UIHandler } from "../../ui";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmationDialog } from "./confirmation-dialog";
import { ShortcutManager } from "@ngx/foundation";

@Injectable()
export class ConfirmationDialogHandler implements UIHandler<ConfirmationDialogRequest> {
  type = ConfirmationDialogRequest;

  // constructor

  constructor(private dialog : MatDialog, private shortcutManager: ShortcutManager) {}

  // implement

  handle(req: ConfirmationDialogRequest): Observable<any> {
      this.shortcutManager.pushLevel()
      return this.dialog.open(ConfirmationDialog,  { data: req.config })
            .afterClosed()
            .pipe(
              tap(() =>  this.shortcutManager.popLevel())
            )
  }
}