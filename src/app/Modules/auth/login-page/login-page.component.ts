import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { delay, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/language.service';
import { throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  standalone: false
})
export class LoginPageComponent implements OnInit {
  username = '';
  password = '';
  errorMsg = '';
  showPassword = false;
  currentLang: string;

  constructor(
    private authService: AuthService,
    private route: Router,
    private translate: TranslateService,
    private languageService: LanguageService
  ) {
    this.currentLang = this.languageService.getCurrentLang();
  }

  ngOnInit() {
    this.authService.logout();
  }

  onLoginOld(event: Event) {
    event.preventDefault();

    if (!this.username || !this.password) {
      this.translate.get('LOGIN.ERRORS.REQUIRED_FIELDS').subscribe((res: string) => {
        this.errorMsg = res;
      });
      return;
    }

    this.authService.loginOld(this.username, this.password).pipe(delay(500)).subscribe(
      (response) => {
        //localStorage.removeItem('structureId');
        this.authService.storeToken(response);
        this.errorMsg = "";
        this.route.navigate(["/landing"]);
      },
      (error) => {
        this.translate.get('LOGIN.ERRORS.INVALID_CREDENTIALS').subscribe((res: string) => {
          this.errorMsg = res;
        });
      }
    );
  }
  onLogin(event: Event) {
    event.preventDefault();

    if (!this.username || !this.password) {
        this.translate.get('LOGIN.ERRORS.REQUIRED_FIELDS').subscribe((res: string) => {
            this.errorMsg = res;
        });
        return;
    }

   
debugger
    this.authService.login( environment.VIPClientId, environment.VIPClientSecret, this.username, this.password).pipe(
        switchMap((response1) => {
          debugger
            if (response1 && response1.access_token) {
                // First token received, now call the second API
                return this.authService.login(environment.clientId, environment.clientSecret, this.username, this.password);
            } else {
                return throwError(() => new Error('INVALID_CREDENTIALS'));
            }
        }),
        delay(500)
    ).subscribe(
        (response2) => {
            this.authService.storeToken(response2);
            this.errorMsg = "";
            this.route.navigate(["/landing"]);
        },
        (error) => {
          debugger
          var errorKey=error.error.error==='unauthorized_client'?'LOGIN.UNATHOURIZED':'LOGIN.ERRORS.INVALID_CREDENTIALS';
          this.translate.get(errorKey).subscribe((res: string) => {
              this.errorMsg = res;
          });
      }
    );
}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  switchLanguage(lang: string) {
    this.currentLang = lang;
    this.languageService.setLanguage(lang);
  }
}
