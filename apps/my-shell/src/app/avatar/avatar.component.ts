// avatar.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SessionManager } from '@ngx/security';

@Component({
    selector: 'avatar',
    template: `
        <div class="avatar" [matTooltip]="user.account">
            <!--img *ngIf="user.avatarUrl; else initials" [src]="user.avatarUrl" [alt]="user.account"/>
            <ng-template #initials>{{ initials }}</ng-template-->
            {{ initials }}
        </div>
    `,
    styles: [`
        .avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--mat-sys-primary);
            color: var(--mat-sys-on-primary);
            font-size: 13px;
            font-weight: 500;
            cursor: default;
            user-select: none;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }
    `],
    standalone: true,
    imports: [MatTooltipModule, CommonModule]
})
export class AvatarComponent {
    private session = inject(SessionManager);

    protected user = this.session.getUser();

    get initials(): string {
        console.log(this.user.account)
        return this.user.account
            .split(' ')
            .map((part: any[]) => part[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }
}