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

    this.mailService.fetchData('/Transfer/ListInbox', localStorage.getItem('structureId') ?? " ", 1, 1, localStorage.getItem('access_token') ?? "", '2')
      .subscribe(
        (response) => {
          this.newMailCount = response.recordsTotal;
          console.log('MyMail:', this.newMailCount);
        },
        (error) => console.error('Error fetching inbox:', error)
      );

    this.mailService.fetchData('/Transfer/ListInbox', localStorage.getItem('structureId') ?? " ", 1, 1, localStorage.getItem('access_token') ?? "", '2', '9')
      .subscribe(
        (response) => {
          this.newSignatureCount = response.recordsTotal;
          console.log('Mail:', this.newSignatureCount);
        },
        (error) => console.error('Error fetching inbox:', error)
      );

    this.mailService.fetchData('/Transfer/ListInbox', localStorage.getItem('structureId') ?? " ", 1, 1, localStorage.getItem('access_token') ?? "", '2', '8')
      .subscribe(
        (response) => {
          this.newGuidelineCount = response.recordsTotal;
          console.log('newGuidelineCount:', this.newGuidelineCount);
        },
        (error) => console.error('Error fetching inbox:', error)
      );


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
