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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
//import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
//import { MatInputModule } from '@angular/material/input';
//import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-system-dashboard',
  imports: [
    CommonModule,
    FormsModule,
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
  minToDate: string | null = null;

  tempFromDate: string = this.fromDate;
  tempToDate: string = this.toDate;
  isModalOpen: boolean = false;

  constructor(private lookupsService: LookupsService,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.getCategories();
  }

  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
    if (this.isModalOpen) {
      this.tempFromDate = this.fromDate;
      this.tempToDate = this.toDate;
    }
  }
 

 openModal(content: any) {
  console.log('open modal');
  this.isModalOpen = true;
  this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
    (result) => {
      this.applyFilter();
    },
    (reason) => {
      this.isModalOpen = false; // Ensure state updates when dismissed
    }
  );
}


  applyFilter() {
    this.fromDate = this.tempFromDate;
    this.toDate = this.tempToDate;
    this.toggleModal();
  }

  getCategories() {
    this.lookupsService.getCategories(undefined).subscribe((res: any) => {
      this.categories = res;
    });
  }

  onFromDateChange() {
    console.log(this.tempFromDate);
    if (this.tempFromDate) {
      let fromDate = new Date(this.tempFromDate);
      fromDate.setDate(fromDate.getDate());
      
      this.minToDate = fromDate.toISOString().split('T')[0];
    } else {
      this.minToDate = null;
    }
  }
}
