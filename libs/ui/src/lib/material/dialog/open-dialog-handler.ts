import { Injectable } from "@angular/core";
import { OpenDialogRequest, UIHandler } from "../../ui";
import { MatDialog } from "@angular/material/dialog";
import { FeatureDialogComponent } from "./feature-dialog";
import { take, tap } from "rxjs";
import { ShortcutManager } from "@ngx/foundation";

@Injectable()
export class OpenDialogHandler implements UIHandler<OpenDialogRequest> {
  type = OpenDialogRequest;

  constructor(private dialog : MatDialog,  private shortcutManager: ShortcutManager) {}

  handle(req: OpenDialogRequest): any {
     this.shortcutManager.pushLevel()
     return this.dialog.open(FeatureDialogComponent,  { data: req.config })
                .afterClosed()
                .pipe(
                  take(1),
                  // call listener
                  tap(() => this.shortcutManager.popLevel())
                )
  }
}