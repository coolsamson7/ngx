 
 
import {
    SessionManager,
    Ticket
} from "@ngx/security";
import {
    AbstractFeature,
    Feature,
    FeatureData,
    FeatureRegistry,
    PortalManager
} from "@ngx/portal";
import { Component, Injector } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbar } from "@angular/material/toolbar";
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Feature({
    id: 'private-portal',
    visibility: ["private"],
    tags: ["portal"],
    router: {
        lazyModule: "PrivatePortalModule"
    }
})
@Component({
    selector: 'private-portal',
    templateUrl: './private-portal-component.html',
    styleUrls: ["./private-portal-component.scss"],
    imports: [CommonModule, MatToolbar, MatButtonModule, RouterOutlet, RouterLink],
})
export class PrivatePortalComponent extends AbstractFeature {
    // instance data

    features : FeatureData[] = []

    // constructor

    constructor(injector: Injector, private portalManager : PortalManager, private router : Router, private sessionManager : SessionManager<any, Ticket>, private featureRegistry : FeatureRegistry) {
        super(injector);

        featureRegistry.registry$.subscribe(_ => this.computeNavigation())
    }

    // callbacks

    about() {
        //this.aboutDialogService.show()
    }

    logout() {
        this.sessionManager.closeSession().subscribe(
            (session) => {
                this.portalManager.loadDeployment(true).then(result =>
                    this.router.navigate(["/"])
                )
            },
            (error) => {
                console.log(error)
            })
    }

    // private

    private computeNavigation() {
        this.features = this.featureRegistry.finder().withEnabled().withTag("navigation").find()
    }
}
