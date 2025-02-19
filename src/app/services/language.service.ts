import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private currentLang = new BehaviorSubject<string>('en');
    currentLang$ = this.currentLang.asObservable();

    constructor(private translate: TranslateService) {
        // Get language from localStorage or default to 'en'
        const savedLang = localStorage.getItem('language') || 'en';
        //const savedLang ='ar';
        this.initializeLanguage(savedLang);
    }

  private initializeLanguage(lang: string) {
    
        this.translate.setDefaultLang(lang);
        this.translate.use(lang);
        this.currentLang.next(lang);
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }

    setLanguage(lang: string) {
        this.initializeLanguage(lang);
    }

    getCurrentLang(): string {
        return localStorage.getItem('language') || 'en';
    }
} 
