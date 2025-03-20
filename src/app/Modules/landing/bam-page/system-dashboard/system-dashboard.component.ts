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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
    BackButtonComponent,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
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
    // Update the actual date variables only when the form is submitted
    const dateFrom = new Date(this.tempFromDate);
    const dateTo = new Date(this.tempToDate);

    // Format to yyyy-mm-dd
    this.tempFromDate = dateFrom.getFullYear() + '-'
      + String(dateFrom.getMonth() + 1).padStart(2, '0') + '-'
      + String(dateFrom.getDate()).padStart(2, '0');

    this.tempToDate = dateTo.getFullYear() + '-'
      + String(dateTo.getMonth() + 1).padStart(2, '0') + '-'
      + String(dateTo.getDate()).padStart(2, '0');

    this.fromDate = this.tempFromDate;
    this.toDate = this.tempToDate;
    this.toggleModal(); // Close the modal after applying the filter
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
      //fromDate.setDate(fromDate.getDate());

      this.tempFromDate = fromDate.getFullYear() + '-'
        + String(fromDate.getMonth() + 1).padStart(2, '0') + '-'
        + String(fromDate.getDate()).padStart(2, '0');

      this.minToDate = this.tempFromDate;
    } else {
      this.minToDate = null;
    }
  }
}
