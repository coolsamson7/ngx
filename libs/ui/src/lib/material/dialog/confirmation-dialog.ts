import { Component, inject, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";

import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { CommonModule } from "@angular/common";
import { I18nModule, TranslatePipe, Translator } from "@ngx/i18n";
import type { ButtonConfiguration, ButtonData, ConfirmationDialogConfig } from "../../ui/elements";
import { get } from "@ngx/common";


export interface ButtonDecorator {
    decorate(button: ButtonData, dialog: CommonDialog) : void
  }
  
class I18NDecorator implements ButtonDecorator {
    // implement ButtonDecorator
  
    decorate(button: ButtonData, dialog: CommonDialog) : void {
        if (button.i18n) {
            const colon = button.i18n.indexOf(":")
            const namespace = button.i18n.substring(0, colon)
            const prefix = button.i18n.substring(colon + 1)
  
            let translations = dialog.translator.findTranslationsFor(namespace)
    
            if ( translations ) {
                if ( prefix.indexOf(".") > 0)
                    button.label = get(translations, prefix)
                else {
                    translations = translations[prefix]
                    
                    if ( translations ) {
                        // clear old values that only make sense in the context of i18n
                        // TODO: these are??
  
                        ["speeech"].forEach(name => (<any>button)[name] = undefined)
  
                        // set new values
  
                        Object.getOwnPropertyNames(translations).forEach(name => {
                            switch (name) {
                                case "label":
                                case "tooltip":
                                case "shortcut":
                                case "speech":
                                    if (!(<any>button)[name])
                                        (<any>button)[name] = translations[name]
                                break;
                        
                                default:
                                    
                            } // switch
                        })
                    }
                } // else
            } // if
        } // if
    }
  }
  
class RunDecorator implements ButtonDecorator {
    // implement ButtonDecorator
  
    decorate(button: ButtonData, dialog: CommonDialog) : void {
      button.run = () => dialog.click(button)
    }
}
  
export abstract class CommonDialog {
    // static
  
    static decorators : ButtonDecorator[] = [new I18NDecorator(), new RunDecorator()]
  
    static addDecorator(decorator: ButtonDecorator) {
      CommonDialog.decorators.push(decorator)
    }
  
    // instance data
  
    translator : Translator
  
    // constructor
  
    constructor(protected dialogRef : MatDialogRef<CommonDialog>) {
      this.translator = inject(Translator)
    }
  
    // protected
  
    protected decorate(button: ButtonConfiguration) : ButtonConfiguration {
        for (const decorator of CommonDialog.decorators)
            decorator.decorate(<ButtonData>button, this)
  
        return button
    }
  
    click(button : ButtonConfiguration) : void {
      // noop
    }
}

@Component({
    selector: 'confirmation-dialog',
    templateUrl: './confirmation-dialog.html',
    styleUrls: ['./confirmation-dialog.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatDialogModule,
        MatButtonModule,
        I18nModule,

        TranslatePipe
    ]
})
export class ConfirmationDialog extends CommonDialog implements OnInit {
    // constructor

    constructor(dialogRef : MatDialogRef<ConfirmationDialog>, @Inject(MAT_DIALOG_DATA) public data : ConfirmationDialogConfig) {
        super(dialogRef)
    }

    // callbacks

    icon() {
        switch (this.data.type) {
            case "info":
                return "info"
            case "warning":
                return "warn"
            case "error":
                return "error"
        }

        return ""
    }

    override click(button : ButtonConfiguration) : void {
        this.dialogRef.close(button.result);
    }

    // implement OnInit

    ngOnInit() : void {
        this.data.buttons.forEach(button => this.decorate(button))

        const button = this.data.buttons.find(button => button.primary)

        if (button)
            this.dialogRef.keydownEvents().subscribe(event => {
                //if (event.key === "Escape") {
                //    this.cancel();
                //}

                if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();

                    this.dialogRef.close(button.result);
                }
            });
    }
}
