import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {

  Homecards = [
    {
      backgroundColor: '#DEF5FF',
      imgSrc: 'assets/images/icons/mail.png',
      title: 'My Mail',
      link: 'MyMail',
    },

    {
      backgroundColor: '#FEEAF3',
      imgSrc: 'assets/images/icons/signature.png',
      title: 'Mail for Signature',
      link: 'mail',
    },
    {
      backgroundColor: '#DEF5FF',
      imgSrc: 'assets/images/icons/reports.png',
      title: 'Reports',
      link: 'reports',
    },
    {
      backgroundColor: '#DEF5FF',
      imgSrc: 'assets/images/icons/BAM.png',
      title: 'BAM',
      link: 'bam',
    },
    {
      backgroundColor: '#D2FAF1',
      imgSrc: 'assets/images/icons/search.png',
      title: 'Search',
      link: 'search',
    },
    {
      backgroundColor: '#FEEAF3',
      imgSrc: 'assets/images/icons/delegate.png',
      title: 'Delegate',
      link: 'delegation',
    },
  ];
}
