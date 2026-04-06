import { OnLocaleChange } from "@ngx/i18n";
import { CommandConfig } from "./command-config";
import { CommandDescriptor } from "./command-descriptor";
import { CommandInterceptor } from "./command-interceptor";
import { ExecutionContext } from "./execution-context";

export interface CommandManager extends OnLocaleChange {
    findCommand(command: string) : CommandDescriptor | undefined

    callSuper<T=any>(...args: any[]) : T

    createdCommand(command: CommandDescriptor) : void

    getCommand(command: string): CommandDescriptor

    setCommandEnabled(command: string, value: boolean): CommandManager

    addCommandInterceptors(commandConfig: CommandConfig, interceptors:  CommandInterceptor[]) : void
}

/**
 * a <code>CommandFilter</code> controls, what commands are returned by the method getCommands
 */
export interface CommandFilter {
    /**
     * if <code>true</code> inherited commands are returned as well
     */
    inherited?: boolean;
    /**
     * an optional group of commands
     */
    group?: string;
  }


export interface CommandAdministration extends CommandManager {
    getCommands(filter: CommandFilter): CommandDescriptor[]

    currentExecutionContext?: ExecutionContext;

    pendingExecutions(): boolean

    pushExecutionContext(context: ExecutionContext): void

    popExecutionContext(context: ExecutionContext): void
}