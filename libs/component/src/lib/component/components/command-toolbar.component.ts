import { Component, Input } from '@angular/core';
import { DelegatingComponent } from '../delegating-component';
import { CommandDescriptor } from '@ngx/foundation';

export interface ToolbarCommandConfig { // TODO 
  menu?: string,
  icon?: string,
  label?: string,
  tooltip?: string
}

export interface CommandToolbar {
  label: boolean;
  addCommand(command: CommandDescriptor, config : ToolbarCommandConfig) : () => void
}

@Component({
  selector: 'ngx-command-toolbar',
  template: `<ng-container #vc></ng-container>`,
  standalone: true
})
export class CommandToolbarComponent extends DelegatingComponent<CommandToolbar> {
  @Input() label = false;

  // implement ?

  addCommand(command: CommandDescriptor, config : ToolbarCommandConfig) : () => void {
      return this.ref.instance.addCommand(command, config);
  }

  protected key(): string {
    return 'command-toolbar';
  }

  protected fallback() {
    return DefaultCommandToolbarComponent;
  }
}

@Component({
  selector: 'default-command-toolbar',
  template: `
    PLEASE IMPLEMENT
  `
})
export class DefaultCommandToolbarComponent implements CommandToolbar {
  addCommand(command: CommandDescriptor, config: ToolbarCommandConfig): () => void {
    return () => {};
  }
  @Input() label = false;
}
