import { NgModule } from "@angular/core";
import { UIModule } from "../ui";
import { SnackbarHandler } from "./snackbar";

@NgModule({
  imports: [
      UIModule.forRoot([
        SnackbarHandler
      ])
  ]
})
export class MaterialUIModule {}