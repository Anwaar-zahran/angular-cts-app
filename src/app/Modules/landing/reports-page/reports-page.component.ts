import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-reports-page',
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.scss',
  standalone: false
})
export class ReportsPageComponent {
  constructor(
    private router: Router,
    private translate: TranslateService
  ) { }

  reportscards = [
    {
      backgroundColor: '#DEF5FF',
      imgSrc: 'assets/images/icons/refresh.png',
      title: 'In Progress Report',
      translationKey: 'REPORTS.IN_PROGRESS_REPORT',
      link: '/reports/inprogress-transfers',
    },
    {
      backgroundColor: '#D2FAF1',
      imgSrc: 'assets/images/icons/time.png',
      title: 'Completed Transfers',
      translationKey: 'REPORTS.COMPLETED_TRANSFERS',
      link: '/reports/completed-transfers',
    },

    {
      backgroundColor: '#FEEAF3',
      imgSrc: 'assets/images/icons/calendar.png',
      title: 'In Progress Correspondences',
      translationKey: 'REPORTS.IN_PROGRESS_CORRESPONDENCES',
      link: '/reports/inprogress-correspondences',
    },

    {
      backgroundColor: '#FEEAF3',
      imgSrc: 'assets/images/icons/calendar.png',
      title: 'Completed Correspondences',
      translationKey: 'REPORTS.COMPLETED_CORRESPONDENCES',
      link: '/reports/completed-correspondences',
    }

  ];
}
