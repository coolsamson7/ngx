import { NgModule } from "@angular/core";
import { UIModule } from "../ui";
import { SnackbarHandler } from "./snackbar";
import { ConfirmationDialogHandler } from "./dialog";
import { OpenDialogHandler } from "./dialog/open-dialog-handler";

@NgModule({
  imports: [
      UIModule.forRoot([
        SnackbarHandler,
        ConfirmationDialogHandler,
        OpenDialogHandler
      ])
  ]
})
export class MaterialUIModule {}