import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { DelegationPageComponent } from './delegation-page/delegation-page.component';
import { MailPageComponent } from './mail-page/mail-page.component';
import { ReportsPageComponent } from './reports-page/reports-page.component';
import { SearchPageComponent } from './search-page/search-page.component';
import { BamPageComponent } from './bam-page/bam-page.component';
import { MymailPageComponent } from './mymail-page/mymail-page.component';
import { GuidelinePageComponent } from './guideline-page/guideline-page.component';
import { CompletedTransfersComponent } from './reports-page/completed-transfers/completed-transfers.component';
import { InprogressTransfersComponent } from './reports-page/inprogress-transfers/inprogress-transfers.component';
import { InProgressCorrespondencesComponent } from './reports-page/in-progress-correspondences/in-progress-correspondences.component';
import { DashboardComponent } from './bam-page/dashboard/dashboard.component';
import { SystemDashboardComponent } from './bam-page/system-dashboard/system-dashboard.component';
import { MasterLayoutComponent } from '../shared/master-layout/master-layout.component';
import { CompleteCorrespondencesComponent } from './reports-page/complete-correspondences/complete-correspondences.component';
import { KpiAverageDurationForCorrespondenceCompletionComponent } from './bam-page/kpi/kpi-average-duration-for-correspondence-completion/kpi-average-duration-for-correspondence-completion.component';
import { KpiAverageDurationForCorrespondenceDelayComponent } from './bam-page/kpi/kpi-average-duration-for-correspondence-delay/kpi-average-duration-for-correspondence-delay.component';
import { KpiAverageDurationForTransferCompletionComponent } from './bam-page/kpi/kpi-average-duration-for-transfer-completion/kpi-average-duration-for-transfer-completion.component';
import { KpiAverageDurationForTransferDelayComponent } from './bam-page/kpi/kpi-average-duration-for-transfer-delay/kpi-average-duration-for-transfer-delay.component';

const routes: Routes = [
  {
    path: '',
    component: MasterLayoutComponent,
    children: [
      {
        path: '',
        component: LandingPageComponent,
      },
      {
        path: 'delegation',
        component: DelegationPageComponent,
      },
      {
        path: 'mail',
        component: MailPageComponent,
      },
      {
        path: 'reports',
        component: ReportsPageComponent,
      },
      {
        path: 'reports/inprogress-transfers',
        component: InprogressTransfersComponent,
      },
      {
        path: 'reports/completed-transfers',
        component: CompletedTransfersComponent,
      },
      {
        path: 'reports/inprogress-correspondences',
        component: InProgressCorrespondencesComponent,
      },
      {
        path: 'reports/completed-correspondences',
        component: CompleteCorrespondencesComponent,
      },
      {
        path: 'search',
        component: SearchPageComponent,
      },
      {
        path: 'MyMail',
        component: MymailPageComponent,
      },
      {
        path: 'Guidelines',
        component: GuidelinePageComponent,
      },
      {
        path: 'bam',
        component: BamPageComponent,
      },
      {
        path: 'bam/dashboard',
        component: DashboardComponent,
      },
      {
        path: 'bam/system-dashboard',
        component: SystemDashboardComponent,
      },
      {
        path: 'bam/kpis/kpi-average-duration-for-correspondence-completion',
        component: KpiAverageDurationForCorrespondenceCompletionComponent,
      },
      {
        path: 'bam/kpis/kpi-average-duration-for-correspondence-delay',
        component: KpiAverageDurationForCorrespondenceDelayComponent,
      },
      {
        path: 'bam/kpis/kpi-average-duration-for-transfer-completion',
        component: KpiAverageDurationForTransferCompletionComponent,
      },
      {
        path: 'bam/kpis/kpi-average-duration-for-transfer-delay',
        component: KpiAverageDurationForTransferDelayComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LandingRoutingModule { }
