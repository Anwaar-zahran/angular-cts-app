import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ChartTransferCompletionStatisticsComponent } from './charts/chart-transfer-completion-statistics/chart-transfer-completion-statistics.component';
import { ChartPercentageOfCorrespondencesCompletedAndInprogressComponent } from './charts/chart-percentage-of-correspondences-completed-and-inprogress/chart-percentage-of-correspondences-completed-and-inprogress.component';
import { ChartDocumentsInProgressOverdueAndOnTimeComponent } from './charts/chart-documents-inProgressOverdue-and-onTime/chart-documents-inProgressOverdue-and-onTime.component';
import { ChartTransfersInProgressOverdueAndOnTimeComponent } from './charts/chart-transfers-inProgressOverdue-and-onTime/chart-transfers-inProgressOverdue-and-onTime.component';
import { ChartTransfersCompletedOverdueAndOnTimePerCategoryComponent } from './charts/chart-transfers-completed-overdue-and-onTime-per-category/chart-transfers-completed-overdue-and-onTime-per-category.component';
import { ChartDocumentsCompletedOverdueAndOnTimePerCategoryComponent } from './charts/chart-documents-completed-overdue-and-onTime-perCategory/chart-documents-completed-overdue-and-onTime-perCategory.component';
import { ChartCountPerCategoryAndStatusComponent } from './charts/chart-count-per-category-and-status/chart-count-per-category-and-status.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Helpers } from '../../../shared/helpers';
import { LookupsService } from '../../../../services/lookups.service';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    ChartTransferCompletionStatisticsComponent,
    ChartPercentageOfCorrespondencesCompletedAndInprogressComponent,
    ChartDocumentsInProgressOverdueAndOnTimeComponent,
    ChartTransfersInProgressOverdueAndOnTimeComponent,
    ChartTransfersCompletedOverdueAndOnTimePerCategoryComponent,
    ChartDocumentsCompletedOverdueAndOnTimePerCategoryComponent,
    ChartCountPerCategoryAndStatusComponent,
    TranslateModule,
    BackButtonComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})

export class DashboardComponent implements OnInit {
  updateFlag = false;
  categories: any[] = [];

  fromDate: string = Helpers.formatDateToYYYYMMDD(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  toDate: string = Helpers.formatDateToYYYYMMDD(new Date());

  tempFromDate: string = this.fromDate;
  tempToDate: string = this.toDate;
  isModalOpen: boolean = false;

  constructor(
    private lookupsService: LookupsService,
    private modalService: NgbModal,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.getCategories();
  }

  private getCategories() {
    debugger;
    this.lookupsService.getCategories(undefined).subscribe((res: any) => {
       
      this.categories = res;
    });
  }

  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
    if (this.isModalOpen) {
      this.tempFromDate = this.fromDate;
      this.tempToDate = this.toDate;
    }
  }

  openModal(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.applyFilter();
    }, (reason) => {
      // Handle dismiss
    });
  }

  applyFilter() {
    this.fromDate = this.tempFromDate;
    this.toDate = this.tempToDate;
    this.toggleModal();
  }
}