import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from '../Modules/auth/auth.service';
import { Router } from '@angular/router';
import { ToasterService } from '../services/toaster.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router,
    private toaster: ToasterService,
    private translate: TranslateService

  ) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      tap(event => {
        // Detect if the API returns a redirect response (302)
        if (event instanceof HttpResponse && event.status === 302) {
          console.warn('Redirect detected: Handling as Unauthorized');
          this.handleUnauthorized();
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 302) {
          this.handleUnauthorized();
        }
        return throwError(() => error);
      })
    );
  }

  private handleUnauthorized() {
  //  this.authService.logout();
  //  this.router.navigate(['/login']);

    console.log('Unauthorized: Triggering toaster notification');
    //this.toaster.showToaster("You are not authorized to view this page");
    this.translate.get('LOGIN.UNATHOURIZED').subscribe((msg: string) => {
      this.toaster.showToaster(msg);
    });
    setTimeout(() => {
    }, 5000); 
  }
}
