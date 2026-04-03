import { NgModule } from "@angular/core";
import { UIModule } from "../ui";
import { SnackbarHandler } from "./snackbar";
import { ConfirmationDialogHandler } from "./dialog";

@NgModule({
  imports: [
      UIModule.forRoot([
        SnackbarHandler,
        ConfirmationDialogHandler
      ])
  ]
})
export class MaterialUIModule {}