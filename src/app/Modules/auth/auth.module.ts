import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { FormsModule } from '@angular/forms';
import { LoginPageComponent } from './login-page/login-page.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [LoginPageComponent,],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    TranslateModule
  ]
})
export class AuthModule { }
