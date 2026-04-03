import { Component, Inject } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule
} from "@angular/material/dialog";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from '@angular/material/tooltip';

import { FeatureOutletDirective } from "@ngx/portal"; // adjust if needed
import { CommandAdministration, CommandDescriptor, ExecutionContext } from "@ngx/foundation";
import type { OpenDialogConfig } from "../../ui";
import { TranslatePipe } from "@ngx/i18n";

@Component({
  selector: "feature-dialog",
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTooltipModule,
    TranslatePipe,
    FeatureOutletDirective
  ],
  styleUrls: ["./feature-dialog.scss"],
  templateUrl: "./feature-dialog.html"
})
export class FeatureDialogComponent {
  // instance data

  private instance!: CommandAdministration;
  commands: CommandDescriptor[] = [];

  // constructor

  constructor(
    private dialogRef: MatDialogRef<FeatureDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OpenDialogConfig
  ) {}

  // public

  isDefault(command: CommandDescriptor): boolean {
    return command.shortcut == 'return' || command.shortcut == 'enter' || false;
  }

  tooltip(command: CommandDescriptor): string {
      return command.tooltip ?? "";
  }
  
  onInstance(instance: CommandAdministration) {
    this.instance = instance;

    // call startup

    if ( this.data.onStartup) {
      const command = this.instance.getCommand(this.data.onStartup.command);

      command.run(...this.data.onStartup.args);
    }

    // create buttons

    for (const commandName of this.data.buttons ?? []) {
      const command = this.instance.getCommand(commandName);

      this.commands.push(command);

      // remember the esc command

      if (command.shortcut == 'esc') {
        // TODO this.escapeCommand = command;
      }

      const dialogRef = this.dialogRef;

      command.addListener({
        onCall(context: ExecutionContext) {
         /* nothin to see */
        },

        onResult(context: ExecutionContext) {
          dialogRef.close(context.result);
        },

        onError(context: ExecutionContext) {
          dialogRef.close(context.error); // is that right?
        }
      });
    }
  }

  onClick(command: CommandDescriptor) {command.run()
    command.run(this.instance);
  }
}