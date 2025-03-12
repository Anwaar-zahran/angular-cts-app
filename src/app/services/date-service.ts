import { Injectable } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
@Injectable({
    providedIn: 'root'
})
export class dateService {
    constructor(private dateAdapter: DateAdapter<any>) {
      const userLang = localStorage.getItem('userLang') || 'en';
      this.changeDate(userLang) 
      }
    
       changeDate(lang: string): void {
        if (lang === 'ar') {
          this.dateAdapter.getDayOfWeekNames = () => ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
          this.dateAdapter.getFirstDayOfWeek = () => 0;
        }  
      }
    }