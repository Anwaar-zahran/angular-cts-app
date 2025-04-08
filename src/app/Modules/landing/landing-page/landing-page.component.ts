import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MailsService } from '../../../services/mail.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
  standalone: false
})
export class LandingPageComponent {

  newMailCount: number = 0;
  newGuidelineCount: number = 0;
  newSignatureCount: number = 0;

  Homecards = [
    {
      backgroundColor: '#DEF5FF',
      imgSrc: 'assets/images/icons/mail.png',
      titleKey: 'LANDING.CARDS.MY_MAIL',
      link: 'MyMail',
    },
    {
      backgroundColor: '#FEEAF3',
      imgSrc: 'assets/images/icons/guidelines.png',
      titleKey: 'LANDING.CARDS.GUIDELINES',
      link: 'Guidelines',
    },
    {
      backgroundColor: '#FEEAF3',
      imgSrc: 'assets/images/icons/signature.png',
      titleKey: 'LANDING.CARDS.SIGNATURE',
      link: 'mail',
    },
    {
      backgroundColor: '#DEF5FF',
      imgSrc: 'assets/images/icons/reports.png',
      titleKey: 'LANDING.CARDS.REPORTS',
      link: 'reports',
    },
    {
      backgroundColor: '#DEF5FF',
      imgSrc: 'assets/images/icons/BAM.png',
      titleKey: 'LANDING.CARDS.BAM',
      link: 'bam',
    },
    {
      backgroundColor: '#D2FAF1',
      imgSrc: 'assets/images/icons/search.png',
      titleKey: 'LANDING.CARDS.SEARCH',
      link: 'search',
    },
    {
      backgroundColor: '#FEEAF3',
      imgSrc: 'assets/images/icons/delegate.png',
      titleKey: 'LANDING.CARDS.DELEGATE',
      link: 'delegation',
    },
  ];

  constructor(private translateService: TranslateService, private mailService: MailsService) {


    this.mailService.fetchNotificationCounts();

    this.mailService.mailUnreadCount$.subscribe(count => {
      this.newMailCount = count;
    });
    this.mailService.signatureUnreadCount$.subscribe(count => {
      this.newSignatureCount = count;
    });
    this.mailService.guidelineUnreadCount$.subscribe(count => {
      this.newGuidelineCount = count;
    });
  }


  getNotificationCount(link: string): number {
    switch (link) {
      case 'MyMail': return this.newMailCount;
      case 'Guidelines': return this.newGuidelineCount;
      case 'mail': return this.newSignatureCount;
      default: return 0;
    }
  }

}
