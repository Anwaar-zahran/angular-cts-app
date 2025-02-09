import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { KpiService } from '../../../../../../services/kpi.service';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { DataTableDirective } from 'angular-datatables';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-kpi-table-average-duration-for-correspondence-delay',
  templateUrl: './kpi-table-average-duration-for-correspondence-delay.component.html',
  styleUrls: ['./kpi-table-average-duration-for-correspondence-delay.component.css'],
  imports: [
    CommonModule,
    DataTablesModule,
    NgbModule,
    FormsModule,
    TranslateModule
  ]
})
export class KpiTableAverageDurationForCorrespondenceDelayComponent implements OnInit {

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  data: any[] = [];
  totalAverage: number = 0;
  @Input() year: number = 2025;
  @Input() entities: any[] = [];
  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  totalItems: number = 0;
  startIndex: number = 0;
  endIndex: number = 0;
  pages: number[] = [];

  // Datatable properties
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();

  constructor(
    private kpiService: KpiService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.initDtOptions();
    this.loadData();
    this.getTotalAverage();
  }

  ngOnChanges() {
    this.loadData();
  }

  private initDtOptions() {
    this.dtOptions = {
      pageLength: 10,
      pagingType: 'full_numbers',
      paging: false,
      searching: false,
      autoWidth: false,
      language: {
        emptyTable: this.translateService.instant('BAM.COMMON.NO_DATA'),
        zeroRecords: this.translateService.instant('BAM.COMMON.NO_MATCHING_RECORDS'),
        info: this.translateService.instant('BAM.COMMON.SHOWING_ENTRIES'),
        infoEmpty: this.translateService.instant('BAM.COMMON.SHOWING_ZERO_ENTRIES')
      },
      dom: "t",
      ordering: false
    };
  }

  private loadData() {
    this.kpiService.ListStructureAverageDurationForCorrespondenceDelay(this.year).subscribe((response: any) => {
      // Map the data to include both structureId and structureName
      this.data = response.data.map((item: any) => {
        const entity = this.entities.find(e => e.id === item.structureId);
        return {
          ...item,
          structureName: entity ? entity.name : 'Unknown Structure', // Add structure name from entities
          structureId: item.structureId // Keep original structureId
        };
      });
      this.totalItems = response.recordsTotal;
      this.calculatePagination();
      this.dtTrigger.next(null);
    });
  }

  getTotalAverage() {
    this.kpiService
      .GetAverageDurationForCorrespondenceDelay(this.year)
      .subscribe((res: any) => {
        this.totalAverage = res.totalAverage;
      });
  }

  drawStructureUserTable(type: string, average: number, year: number, userId: number | null, structureId: number) {
    // Implement the logic to draw the structure user table
    console.log(`Drawing table for ${type} with average ${average}, year ${year}, userId ${userId}, structureId ${structureId}`);
  }

  openStructureChart(type: string, average: number, year: number, userId: number | null, structureId: number) {
    // Implement the logic to open the structure chart
    console.log(`Opening chart for ${type} with average ${average}, year ${year}, userId ${userId}, structureId ${structureId}`);
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.totalItems / this.dtOptions.pageLength);
    this.startIndex = (this.currentPage - 1) * this.dtOptions.pageLength + 1;
    this.endIndex = Math.min(this.startIndex + this.dtOptions.pageLength - 1, this.totalItems);

    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadData();
  }
}
