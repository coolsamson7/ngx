import { GConstructor ,registerMixins, hasMixin } from "@ngx/common";

import { Component, ViewChild} from "@angular/core";
import { CommandToolbarComponent } from "./command-toolbar.component";
import { CommandManager } from "@ngx/foundation";
import { AbstractFeature } from "@ngx/portal";

export interface ToolbarCommandConfig {
  menu?: string,
  icon?: string,
  label?: string,
  tooltip?: string
}

export interface WithCommandToolbar {
    commandToolbar?: CommandToolbarComponent

    buildToolbar() :void

    addCommand2Toolbar(command: string, config? : ToolbarCommandConfig) : WithCommandToolbar
}

export enum AddCommands {
  ON_CREATE,
  ON_SHOW
}

export interface WithCommandToolbarConfig {
  addCommands?: AddCommands
}

export function WithCommandToolbar<T extends GConstructor<CommandManager & AbstractFeature>>(base: T, config : WithCommandToolbarConfig = {}) :GConstructor<WithCommandToolbar> &  T  {
  @Component({
          selector: 'with-command-toolbar-component',
          template: ""
 })
  class WithCommandToolbarClass extends base implements WithCommandToolbar {
        // instance data

        @ViewChild(CommandToolbarComponent) commandToolbar? : CommandToolbarComponent

        addCommands = config.addCommands ?? AddCommands.ON_CREATE

        // private

        private findToolbar() {
          if (!this.commandToolbar) {
            for ( let parent = this.parent; parent != undefined && this.commandToolbar === undefined; parent = parent?.parent)
              if ( hasMixin(parent, WithCommandToolbar))
                this.commandToolbar = (<WithCommandToolbar><unknown>parent).commandToolbar

            if ( !this.commandToolbar)
              throw new Error("didn't find any <command-toolbar> for component " + this.constructor.name)
          }
        }

        // override OnInit

        override ngAfterViewInit() {
         super.ngAfterViewInit();

         this.findToolbar()

         if ( this.addCommands == AddCommands.ON_CREATE)
            this.buildToolbar()
         else {
            // TODO resizeObservable
          }
      }

      // implement WithCommandToolbar

      buildToolbar() : void {
      }

      addCommand2Toolbar(command: string, config : ToolbarCommandConfig = {}) : WithCommandToolbar {
        this.onDestroy(this.commandToolbar!.addCommand(this.getCommand(command), config))

        return this
      }
    }

    return registerMixins(WithCommandToolbarClass, WithCommandToolbar)
  }
