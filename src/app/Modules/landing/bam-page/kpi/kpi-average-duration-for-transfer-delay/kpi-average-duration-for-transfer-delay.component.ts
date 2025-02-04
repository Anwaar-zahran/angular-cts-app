import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Helpers } from '../../../../shared/helpers';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { LookupsService } from '../../../../../services/lookups.service';
import { KpiTableAverageDurationForTransferDelayComponent } from './kpi-table-average-duration-for-transfer-delay/kpi-table-average-duration-for-transfer-delay.component';
import { KpiChartAverageDurationForTransferDelayComponent } from './kpi-chart-average-duration-for-transfer-delay/kpi-chart-average-duration-for-transfer-delay.component';

@Component({
    selector: 'app-kpi-average-duration-for-transfer-delay',
    templateUrl: './kpi-average-duration-for-transfer-delay.component.html',
    styleUrls: ['./kpi-average-duration-for-transfer-delay.component.css'],
    imports: [
        CommonModule, FormsModule, NgbModalModule,
        KpiChartAverageDurationForTransferDelayComponent,
        KpiTableAverageDurationForTransferDelayComponent
    ]
})
export class KpiAverageDurationForTransferDelayComponent implements OnInit {
  year!: number;
  tempYear!: number;
  isModalOpen: boolean = false;
  availableYears: number[] = [];
  entities: any[] = [];

  constructor(private lookupsService: LookupsService) { }

  ngOnInit() {
    this.lookupsService.getEntities().subscribe((entities: any[]) => {
      this.entities = entities;
    });

    this.lookupsService.getYears().subscribe((years: any[]) => {
      this.availableYears = years;
      this.year = this.availableYears[this.availableYears.length - 1];
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
