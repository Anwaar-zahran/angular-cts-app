import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { delay } from 'rxjs/operators';


@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  username = '';
  password = '';
  errorMsg = '';
  showPassword = false;

  constructor(private authService: AuthService, private route: Router) { }

  ngOnInit() {
    this.authService.logout();
  }
  onLogin(event: Event) {
    event.preventDefault();

    if (!this.username || !this.password) {
      this.errorMsg = "Username or password cannot be empty";
      return;
    }
    this.authService.login(this.username, this.password).pipe(delay(500)).subscribe(
      (response) => {
        this.authService.storeToken(response);

        this.errorMsg = "";
        this.route.navigate(["/landing"]);
      },
      (error) => {

        this.errorMsg = "Username or password is incorrect";
      });


  }


  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
