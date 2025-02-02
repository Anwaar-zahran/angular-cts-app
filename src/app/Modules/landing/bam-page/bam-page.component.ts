import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-bam-page',
    templateUrl: './bam-page.component.html',
    styleUrl: './bam-page.component.scss',
    standalone: false
})
export class BamPageComponent {
  constructor(private router: Router) { }

  BAMCards = [
    {
      backgroundColor: '#DEF5FF',
      imgSrc: 'assets/images/icons/BAM.png',
      title: 'Dashboard',
      link: '/bam/dashboard',
    },
    {
      backgroundColor: '#FEEAF3',
      imgSrc: 'assets/images/icons/BAM.png',
      title: 'System Dashboard',
      link: '/bam/system-dashboard',
    },
    {
      backgroundColor: '#FEEAF3',
      imgSrc: 'assets/images/icons/BAM.png',
      title: 'Average Duration for Correspondence Completion',
      link: '/bam/kpis/kpi-average-duration-for-correspondence-completion',
    },
    {
      backgroundColor: '#FEEAF3',
      imgSrc: 'assets/images/icons/BAM.png',
      title: 'Average Duration for Correspondence Delay',
      link: '/bam/kpis/kpi-average-duration-for-correspondence-delay',
    },
    {
      backgroundColor: '#FEEAF3',
      imgSrc: 'assets/images/icons/BAM.png',
      title: 'Average duration for transfer completion',
      link: '/bam/kpis/kpi-average-duration-for-transfer-completion',
    },
    {
      backgroundColor: '#FEEAF3',
      imgSrc: 'assets/images/icons/BAM.png',
      title: 'Average duration for transfer delay',
      link: '/bam/kpis/kpi-average-duration-for-transfer-delay',
    }

  ];
}
