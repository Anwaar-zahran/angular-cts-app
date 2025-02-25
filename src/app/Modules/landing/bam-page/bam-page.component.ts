import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-bam-page',
  templateUrl: './bam-page.component.html',
  styleUrl: './bam-page.component.scss',
  standalone: false
})
export class BamPageComponent {
  constructor(
    private router: Router,
    private translate: TranslateService
  ) { }

  BAMCards = [
    {
      backgroundColor: '#DEF5FF',
      imgSrc: 'assets/images/icons/dashboard.svg',
      title: 'BAM.DASHBOARD.USER_DASHBOARD_TITLE',
      link: '/bam/dashboard',
    },
    {
      backgroundColor: '#FEEAF3',
      imgSrc: 'assets/images/icons/chart.png',
      title: 'BAM.SYSTEM_DASHBOARD',
      link: '/bam/system-dashboard',
    },
    {
      backgroundColor: '#DEF5FF',
      imgSrc: 'assets/images/icons/system_dash.svg',
      title: 'BAM.AVERAGE_DURATION_CORRESPONDENCE_COMPLETION',
      link: '/bam/kpis/kpi-average-duration-for-correspondence-completion',
    },
    {
      backgroundColor: '#DEF5FF',
      imgSrc: 'assets/images/icons/clock_corr.svg',
      title: 'BAM.AVERAGE_DURATION_CORRESPONDENCE_DELAY',
      link: '/bam/kpis/kpi-average-duration-for-correspondence-delay',
    },
    {
      backgroundColor: '#D2FAF1',
      imgSrc: 'assets/images/icons/refresh.png',
      title: 'BAM.AVERAGE_DURATION_TRANSFER_COMPLETION',
      link: '/bam/kpis/kpi-average-duration-for-transfer-completion',
    },
    {
      backgroundColor: '#FEEAF3',
      width: '180px',
      imgSrc: 'assets/images/icons/delay.svg',
      title: 'BAM.AVERAGE_DURATION_TRANSFER_DELAY',
      link: '/bam/kpis/kpi-average-duration-for-transfer-delay',
    }
  ];
}