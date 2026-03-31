 
import { Component } from '@angular/core';
import { FeatureData, FeatureRegistry, FeatureOutletDirective } from "@ngx/portal";
import { SessionManager, Ticket } from "@ngx/security";

@Component({
    selector: 'app-root',
    templateUrl: './shell.component.html',
    styleUrls: ['./shell.component.scss'],
    imports: [FeatureOutletDirective]
})
export class ShellComponent {
    // instance data

    portal : FeatureData

    // constructor

    constructor(private featureRegistry : FeatureRegistry, private sessionManager : SessionManager<any, Ticket>) {
        // public portal

        this.portal = this.determinePortal();

        // subscribe in order to react to a login

        featureRegistry.registry$.subscribe(registry => this.portal = this.determinePortal())
    }

    // private

    private determinePortal() : FeatureData {
        return this.featureRegistry.finder()
          .withTag("portal")
          .withVisibility(this.sessionManager.hasSession() ? "private" : "public")
          .findOne()
    }
}
