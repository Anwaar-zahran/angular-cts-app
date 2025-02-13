import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { JwtModule } from '@auth0/angular-jwt';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';  // Required for Material Datepicker
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

// Imports
import { HeaderComponent } from './Modules/shared/header/header.component';
import { FooterComponent } from './Modules/shared/footer/footer.component';
import { MasterLayoutComponent } from './Modules/shared/master-layout/master-layout.component';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './Modules/shared/shared.module';
import { LandingModule } from './Modules/landing/landing.module';
import { AuthModule } from './Modules/auth/auth.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ReactiveFormsModule } from '@angular/forms';
//import { AddressBookComponent } from './Modules/landing/address-book/address-book.component';

declare var $: any;
if (typeof $ !== 'undefined') {
  $.fn.dataTable.ext.errMode = 'none';
}

export function tokenGetter() {
  return localStorage.getItem('access_token'); // Get the access token from localStorage
}

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    MasterLayoutComponent,
    //  AddressBookComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    SharedModule,
    LandingModule,
    AuthModule,
    NgbModule,
    DataTablesModule.forRoot(),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    JwtModule.forRoot({
        config: {
            tokenGetter: tokenGetter, // Helps JwtHelperService find the token
            allowedDomains: ['localhost:8090'], // Define the allowed API domains
            disallowedRoutes: [] // Specify routes that do not require a token
        }
    }),
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
        }
    }),
],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
