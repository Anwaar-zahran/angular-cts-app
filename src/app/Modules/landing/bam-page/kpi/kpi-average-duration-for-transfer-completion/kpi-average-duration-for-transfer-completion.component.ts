import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Helpers } from '../../../../shared/helpers';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { LookupsService } from '../../../../../services/lookups.service';
import { TranslateModule } from '@ngx-translate/core';
import { KpiChartAverageDurationForTransferCompletionComponent } from './kpi-chart-average-duration-for-transfer-completion/kpi-chart-average-duration-for-transfer-completion.component';
import { KpiTableAverageDurationForTransferCompletionComponent } from './kpi-table-average-duration-for-transfer-completion/kpi-table-average-duration-for-transfer-completion.component';
import { KpiService } from '../../../../../services/kpi.service';
import { BackButtonComponent } from '../../../../shared/back-button/back-button.component';
@Component({
  selector: 'app-kpi-average-duration-for-transfer-completion',
  templateUrl: './kpi-average-duration-for-transfer-completion.component.html',
  styleUrls: ['./kpi-average-duration-for-transfer-completion.component.css'],
  imports: [
    CommonModule, FormsModule, NgbModalModule,
    TranslateModule,
    KpiChartAverageDurationForTransferCompletionComponent,
    KpiTableAverageDurationForTransferCompletionComponent,
    BackButtonComponent
  ]
})
export class KpiAverageDurationForTransferCompletionComponent implements OnInit {

  year!: number;
  tempYear!: number;
  isModalOpen: boolean = false;
  availableYears: number[] = [];

  fromDate: string = Helpers.formatDateToYYYYMMDD(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  toDate: string = Helpers.formatDateToYYYYMMDD(new Date());
  entities: any[] = [];
  constructor(private lookupsService: LookupsService, private kpiService: KpiService) { }
  ngOnInit() {
    this.lookupsService.getEntities().subscribe((entities: any[]) => {
      this.entities = entities;
    });

    this.lookupsService.getYears().subscribe((years: any[]) => {
      this.availableYears = years;
      this.availableYears ?.sort((a, b) => a - b);
      this.year = this.availableYears[this.availableYears ?.length - 1];
      this.tempYear = this.year;
    });

  }


  applyFilter() {
    this.isModalOpen = false;
    this.year = this.tempYear;
  }

  closeModal() {
    this.isModalOpen = false;
  }



}
