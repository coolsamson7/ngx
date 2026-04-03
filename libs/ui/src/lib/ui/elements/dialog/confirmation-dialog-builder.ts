import { Observable } from "rxjs";
import { UIRequest } from "../../ui-request";
import { UIExecutor } from "../../ui-executor";

export interface ButtonConfiguration {
    label?: string
    shortcut?: string
    tooltip?: string
    speech?: string
    i18n?: string

    result : any
    primary? : boolean
}

export interface ButtonData extends ButtonConfiguration {
  run: () => any
}

export interface ConfirmationDialogConfig {
    title : string;
    type : string;
    message : string;
    buttons : ButtonConfiguration[]
}

export class ConfirmationDialogRequest implements UIRequest<Observable<any>> {
  constructor(public readonly config: ConfirmationDialogConfig) {}
}

export class ConfirmationDialogBuilder {
    // instance data

    configuration : ConfirmationDialogConfig = {
        type: "info",
        title: "",
        message: "",
        buttons: []
    }

    // constructor

    constructor(private executor : UIExecutor) {
    }

    // fluent

    /**
     * set the dialog type
     * @param type the type
     */
    type(type : "info" | "warning" | "error") : ConfirmationDialogBuilder {
        this.configuration.type = type;

        return this;
    }

    /**
     * set the dialog title
     * @param title the title
     */
    title(title : string) : ConfirmationDialogBuilder {
        this.configuration.title = title;

        return this;
    }

    /**
     * set the dialog message
     * @param message the message
     */
    message(message : string) : ConfirmationDialogBuilder {
        this.configuration.message = message;

        return this;
    }

    /**
     * add a button
     * @param button the {@link ButtonConfiguration}
     */
    button(button : ButtonConfiguration) : ConfirmationDialogBuilder {
        this.configuration.buttons.push(button);

        return this;
    }

    // convenience

    /**
     * add "ok"
     */
    public ok() : ConfirmationDialogBuilder {
        return this
            .button({
                i18n: "portal.commands:ok",
                primary: true,
                result: true
            })
    }

    /**
     * add "ok" and "cancel" buttons
     */
    public okCancel() : ConfirmationDialogBuilder {
        return this
            .button({
                i18n: "portal.commands:ok",
                primary: true,
                result: true
            })
            .button({
                i18n: "portal.commands:cancel",
                result: undefined
            })
    }

    // show

    /**
     * show the dialog and return the button value
     */
    show() : Observable<any> {
        return this.executor.render(new ConfirmationDialogRequest(this.configuration)) as Observable<any>; // TODO why cast
    }
}
