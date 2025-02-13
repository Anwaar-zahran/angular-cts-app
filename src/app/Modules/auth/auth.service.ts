import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
//import { JwtHelperService } from '@auth0/angular-jwt';
//import jwt_decode from 'jwt-decode';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // private iAMURL = "http://localhost:8090/connect/token";   //to be read from config
  private iAMURL = `${environment.iAMUrl}/connect/token`;   //to be read from config
  private clientId = "5d2c8fa5-9f58-430c-bcf2-5f4366d425dc";   //to be read from config
  private clientSecret = "d85a0d00-a065-4d8e-b001-f39d69951555";   //to be read from config
  private scope = 'openid IdentityServerApi offline_access';
  private aud = 'IdentityServerApi offline_access';
  private grantType = 'password';

  constructor(private http: HttpClient, private router: Router, private jwtHelper: JwtHelperService) { }

  login(username: string, password: string): Observable<any> {
    const body = new URLSearchParams();
    body.set("client_id", this.clientId)
    body.set("client_secret", this.clientSecret)
    body.set("scope", this.scope)
    //body.set("aud",this.aud)
    body.set("username", username)
    body.set("password", password)
    body.set("grant_type", this.grantType)

    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

    return this.http.post(this.iAMURL, body.toString(), { headers })
      .pipe(
        catchError((error) => {
          console.error('Error during login', error.message);
          return throwError(error);
        })
      );
  }

  storeToken(response: any): void {
    localStorage.setItem('access_token', response.access_token);
    const expiryTime = new Date().getTime() + response.expires_in * 1000;
    localStorage.setItem('expiry', JSON.stringify(expiryTime));

    const username = this.getUserName();
    this.currentUserName.next(username);
  }

  getToken(): string | null {
    const token = localStorage.getItem('access_token');
    const expiry = JSON.parse(localStorage.getItem('expiry') || '0');

    if (token && expiry && new Date().getTime() < expiry) {
      return token;
    } else {
      // Token is not found or has expired
      return null;
    }
  }

  private currentUserName: BehaviorSubject<string> = new BehaviorSubject<string>(this.getUserName());
  // Subscribe this in components to get updates on username
  get CurrentUser() {
    return this.currentUserName.asObservable();
  }

  getUserName(): string {
    const token = localStorage.getItem('access_token');
    if (token && token.split('.').length === 3) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken.Username || '';
    }
    return '';
  }

  getCurrentUserFullName(): string {
    const fullName = localStorage.getItem('currentUser');
    return fullName || '';
  }

  getDisplayName(): string {
    const token = localStorage.getItem('access_token');
    if (token && token.split('.').length === 3) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken.DisplayName || '';
    }
    return '';
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('expiry');
    this.currentUserName.next('');  // Clear the username in BehaviorSubject
    this.router.navigate(["/login"]);

  }
}
