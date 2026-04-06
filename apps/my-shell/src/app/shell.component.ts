 
import { Component, HostListener } from '@angular/core';
import { ShortcutManager } from '@ngx/common';
import { FeatureData, FeatureRegistry, FeatureOutletDirective } from '@ngx/portal';
import {
  SessionManager,
  Ticket,
} from '@ngx/security';
import { TraceFooterComponent } from './trace/trace.component';
import { FooterTrace } from './shell.module';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  imports: [FeatureOutletDirective, TraceFooterComponent],
  standalone: true
})
export class ShellComponent {
  // instance data

  portal: FeatureData;
  entries = toSignal(FooterTrace.entries$, { initialValue: [] });

  // constructor

  constructor(
    private featureRegistry: FeatureRegistry,
    private shortcutManager: ShortcutManager,
    private sessionManager: SessionManager<any, Ticket>
  ) {
    // public portal

    this.portal = this.determinePortal();

    // subscribe in order to react to a login

    featureRegistry.registry$.subscribe(
      (registry) => (this.portal = this.determinePortal())
    );
  }

  @HostListener('window:keydown', ['$event'])
  public handleKeydown(e : any) {
      this.shortcutManager.handleKeydown(e);
  }

  // private

  private determinePortal(): FeatureData {
    return this.featureRegistry
      .finder()
      .withTag('portal')
      .withVisibility(this.sessionManager.hasSession() ? 'private' : 'public')
      .findOne();
  }
}
