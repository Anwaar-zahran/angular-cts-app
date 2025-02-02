import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Helpers } from '../../../../shared/helpers';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { LookupsService } from '../../../../../services/lookups.service';
import { KpiChartAverageDurationForCorrespondenceDelayComponent } from './kpi-chart-average-duration-for-correspondence-delay/kpi-chart-average-duration-for-correspondence-delay.component';
import { KpiTableAverageDurationForCorrespondenceDelayComponent } from './kpi-table-average-duration-for-correspondence-delay/kpi-table-average-duration-for-correspondence-delay.component';

@Component({
  selector: 'app-kpi-average-duration-for-correspondence-delay',
  templateUrl: './kpi-average-duration-for-correspondence-delay.component.html',
  styleUrls: ['./kpi-average-duration-for-correspondence-delay.component.css'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, NgbModalModule,
    KpiChartAverageDurationForCorrespondenceDelayComponent,
    KpiTableAverageDurationForCorrespondenceDelayComponent
  ],
})
export class KpiAverageDurationForCorrespondenceDelayComponent implements OnInit {

  year!: number;
  tempYear!: number;
  isModalOpen: boolean = false;
  availableYears: number[] = [];

  fromDate: string = Helpers.formatDateToYYYYMMDD(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  toDate: string = Helpers.formatDateToYYYYMMDD(new Date());

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
