import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { Inject } from '@angular/core';
import { Injector } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeAr from '@angular/common/locales/ar';
import { DateAdapter } from '@angular/material/core';
@Injectable({
    providedIn: 'root'
})
export class LanguageService {

    private currentLang = new BehaviorSubject<string>('en');
    currentLang$ = this.currentLang.asObservable();

    constructor(private translate: TranslateService, private injector: Injector,private dateAdapter: DateAdapter<any>) {
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
        this.dateAdapter.setLocale(lang);
        this.changeLocale(lang);
    }

    setLanguage(lang: string) {
        this.initializeLanguage(lang);
    }

    getCurrentLang(): string {
        return localStorage.getItem('language') || 'en';
    }

    private changeLocale(lang: string) {
        if (lang === 'ar') {
            registerLocaleData(localeAr);
            this.dateAdapter.getDayOfWeekNames = () => ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
            this.dateAdapter.getFirstDayOfWeek = () => 0;
        } else {
            registerLocaleData(localeEn);
        }
    }
} 
