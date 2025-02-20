import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if(this.authService.isAuthenticated()) {
      return true; // User is logged in, allow route activation
    }
    else {
      debugger;
      // User is not authenticated, redirect to login
      //this.router.navigate(['/login'], {
      //  queryParams: { returnUrl: state.url }
      //});
      return false;
    }
  }
}

