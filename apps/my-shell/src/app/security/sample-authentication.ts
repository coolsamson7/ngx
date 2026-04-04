import { Authentication, AuthenticationRequest, Ticket } from '@ngx/security';
import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';

interface SampleUser {
  permissions: string[];
}

@Injectable({ providedIn: 'root' })
export class SampleAuthentication
  implements Authentication<SampleUser, Ticket>
{
  // implement Authentication

  authenticate(request: AuthenticationRequest) {
    const { user, password } = request;

    return of({
      user: {
          account: request.user,
          permissions: []
      },
      ticket: {},
    });
  }
}
