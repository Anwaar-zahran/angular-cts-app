import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Helpers } from '../../../../shared/helpers';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ChartAverageDurationForCorrespondenceCompletionComponent } from './chart-average-duration-for-correspondence-completion/chart-average-duration-for-correspondence-completion.component';
import { TableStructureAverageDurationForCorrespondenceCompletionComponent } from './table-structure-average-duration-for-correspondence-completion/table-structure-average-duration-for-correspondence-completion.component';
import { LookupsService } from '../../../../../services/lookups.service';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-kpi-average-duration-for-correspondence-completion',
  templateUrl: './kpi-average-duration-for-correspondence-completion.component.html',
  styleUrls: ['./kpi-average-duration-for-correspondence-completion.component.css'],
  imports: [
    CommonModule, FormsModule, NgbModalModule,
    TranslateModule,
    ChartAverageDurationForCorrespondenceCompletionComponent,
    TableStructureAverageDurationForCorrespondenceCompletionComponent
  ]
})
export class KpiAverageDurationForCorrespondenceCompletionComponent implements OnInit {
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
