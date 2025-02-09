import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { delay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/language.service';

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

  onLogin(event: Event) {
    event.preventDefault();

    if (!this.username || !this.password) {
      this.translate.get('LOGIN.ERRORS.REQUIRED_FIELDS').subscribe((res: string) => {
        this.errorMsg = res;
      });
      return;
    }

    this.authService.login(this.username, this.password).pipe(delay(500)).subscribe(
      (response) => {
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

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  switchLanguage(lang: string) {
    this.currentLang = lang;
    this.languageService.setLanguage(lang);
  }
}
