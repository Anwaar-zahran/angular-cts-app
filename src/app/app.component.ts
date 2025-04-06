import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LoaderService } from './services/loader.service';
import { LanguageService } from './services/language.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {

  isLoading = false;
  message = '';

  constructor(public loaderService: LoaderService, private languageService: LanguageService,private cdRef: ChangeDetectorRef) { }
  
  ngOnInit() {
    // This will initialize the language from localStorage
    const savedLang = localStorage.getItem('language') || 'en';
    this.languageService.setLanguage(savedLang);

    this.loaderService.isLoading$.subscribe(value => {
      console.log('isLoading:', value);
      setTimeout(() => this.isLoading = value);
    });

    
    this.loaderService.message$.subscribe(value => {
      setTimeout(() => this.message = value);
    });
  }
}
