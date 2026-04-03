import { SnackbarRequest, UIHandler } from "../ui";

export class SnackbarHandler
  implements UIHandler<SnackbarRequest> {

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