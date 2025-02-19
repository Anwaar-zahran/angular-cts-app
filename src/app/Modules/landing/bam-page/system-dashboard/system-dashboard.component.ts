import { Component } from '@angular/core';
import Highcharts from 'highcharts';
import { ChartSystemCountPerCategoryAndStatusComponent } from './charts/chart-system-count-per-category-and-status/chart-system-count-per-category-and-status.component';
import { Helpers } from '../../../shared/helpers';
import { LookupsService } from '../../../../services/lookups.service';
import { ChartSystemStatisticsPerDepartmentComponent } from './charts/chart-system-statistics-per-department/chart-system-statistics-per-department.component';
import { ChartSystemDocumentsInProgressOverdueAndOnTimePerCategoryComponent } from './charts/chart-system-documents-inProgress-overdue-and-onTime-per-category/chart-system-documents-inProgress-overdue-and-onTime-per-category.component';
import { ChartSystemDocumentsCompletedOverdueAndOnTimePerCategoryComponent } from './charts/chart-system-documents-completed-overdue-and-onTime-per-category/chart-system-documents-completed-overdue-and-onTime-per-category.component';
import { ChartSystemTransfersInProgressOverdueAndOnTimePerCategoryComponent } from './charts/chart-system-transfers-inProgressOverdue-and-onTime-per-category/chart-system-transfers-inProgressOverdue-and-onTime-per-category.component';
import { ChartSystemTransfersCompletedOverdueAndOnTimePerCategoryComponent } from './charts/chart-system-transfers-completed-overdue-and-onTime-per-category/chart-system-transfers-completed-overdue-and-onTime-per-category.component';
import { TranslateModule } from '@ngx-translate/core';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-system-dashboard',
  imports: [
    ChartSystemCountPerCategoryAndStatusComponent,
    ChartSystemStatisticsPerDepartmentComponent,
    ChartSystemDocumentsInProgressOverdueAndOnTimePerCategoryComponent,
    ChartSystemDocumentsCompletedOverdueAndOnTimePerCategoryComponent,
    ChartSystemTransfersInProgressOverdueAndOnTimePerCategoryComponent,
    ChartSystemTransfersCompletedOverdueAndOnTimePerCategoryComponent,
    TranslateModule,
    BackButtonComponent
  ],
  templateUrl: './system-dashboard.component.html',
  styleUrl: './system-dashboard.component.scss'
})
export class SystemDashboardComponent {
  Highcharts: typeof Highcharts = Highcharts;
  updateFlag = false;


  fromDate: string = Helpers.formatDateToYYYYMMDD(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  toDate: string = Helpers.formatDateToYYYYMMDD(new Date());
  categories: any[] = [];

  constructor(private lookupsService: LookupsService) { }

  ngOnInit() {
    this.getCategories();
  }

  getCategories() {
    this.lookupsService.getCategories(undefined).subscribe((res: any) => {
      this.categories = res?.data;
    });
  }





}
