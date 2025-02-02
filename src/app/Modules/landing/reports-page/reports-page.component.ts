import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reports-page',
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.scss'
})
export class ReportsPageComponent {
  constructor(private router: Router) { }

  reportscards = [
    {
      backgroundColor: '#DEF5FF',
      imgSrc: 'assets/images/icons/refresh.png',
      title: 'In Progress Report',
      link: '/reports/inprogress-transfers',
    },
    {
      backgroundColor: '#D2FAF1',
      imgSrc: 'assets/images/icons/time.png',
      title: 'Completed Transfers',
      link: '/reports/completed-transfers',
    },

    {
      backgroundColor: '#FEEAF3',
      imgSrc: 'assets/images/icons/calendar.png',
      title: 'In Progress Correspondences',
      link: '/reports/inprogress-correspondences',
    },

    {
      backgroundColor: '#FEEAF3',
      imgSrc: 'assets/images/icons/calendar.png',
      title: 'Completed Correspondences',
      link: '/reports/completed-correspondences',
    }

  ];
}
