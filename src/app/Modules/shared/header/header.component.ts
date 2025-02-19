import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: false
})
export class HeaderComponent implements OnInit {
  currentLang: string;
  userInfo = { name: "Fatima AliAhmad", Job: "Frontend Developer", ID: 1234, image: null }
  showMenu: boolean = true;

  MainnavItems = [
    { link: 'MyMail', icon: 'assets/images/icons/email.svg', title: 'LANDING.CARDS.MY_MAIL' },
    { link: 'Guidelines', icon: 'assets/images/icons/Union.svg', title: 'LANDING.CARDS.GUIDELINES' },
    { link: 'mail', icon: 'assets/images/icons/signature-with-a-pen.svg', title: 'LANDING.CARDS.SIGNATURE' },
    { link: 'reports', icon: 'assets/images/icons/report.svg', title: 'LANDING.CARDS.REPORTS' },
    { link: 'bam', icon: 'assets/images/icons/analytics.svg', title: 'LANDING.CARDS.BAM' },
    { link: 'search', icon: 'assets/images/icons/search.svg', title: 'LANDING.CARDS.SEARCH' },
    { link: 'delegation', icon: 'assets/images/icons/delegate.svg', title: 'LANDING.CARDS.DELEGATE' },
  ];

  userNav = [
    { link: '#', title: 'HEADER.USER_NAV.LOGOUT' },
  ];

  languages = [
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'ar', name: 'العربية', dir: 'rtl' }
  ];

  userName = "";

  constructor(
    private route: Router,
    private authService: AuthService,
    private translateService: TranslateService
  ) {
    this.currentLang = this.translateService.currentLang || 'en';
  }

  ngOnInit(): void {
    this.authService.CurrentUser.subscribe(user => {
      this.userName = user;
    });

    this.route.events.subscribe(() => {
      this.showMenu = this.route.url !== '/landing';
    });
  }

  onLogout(event: Event) {
    event.preventDefault();
    this.authService.logout();
  }

  switchLanguage(lang: string) {
    debugger;
    this.translateService.use(lang);
    localStorage.setItem('language', lang);
    this.currentLang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    window.location.reload();
  }

  getCurrentLangName(): string {
    return this.languages.find(lang => lang.code === this.currentLang)?.name || 'English';
  }
}
