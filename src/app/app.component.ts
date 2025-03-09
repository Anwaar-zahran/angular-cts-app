import { Component, OnInit } from '@angular/core';
import { LoaderService } from './services/loader.service';
import { LanguageService } from './services/language.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent {
  constructor(public loaderService: LoaderService, private languageService: LanguageService) { }
  ngOnInit() {
    // This will initialize the language from localStorage
    const savedLang = localStorage.getItem('language') || 'en';
    this.languageService.setLanguage(savedLang);
  }
}
