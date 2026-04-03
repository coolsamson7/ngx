import { Injectable } from "@angular/core";
import { SnackbarRequest, UIHandler } from "../ui";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable() 
export class SnackbarHandler implements UIHandler<SnackbarRequest> {

  type = SnackbarRequest;

  constructor(private snackBar: MatSnackBar) {}

  handle(req: SnackbarRequest): void {
    this.snackBar.open(
      req.message,
      req.options?.action,
      { duration: req.options?.duration }
    );
  }
}