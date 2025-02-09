import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginPageComponent } from './login-page/login-page.component';
import { TranslateModule } from '@ngx-translate/core';


const routes: Routes = [
  {
    path: '',
    component: LoginPageComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), FormsModule, TranslateModule],
  exports: [RouterModule],
})
export class AuthRoutingModule { }
