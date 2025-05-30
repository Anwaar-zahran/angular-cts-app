import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableDirective, DataTablesModule } from 'angular-datatables';
import { KpiService } from '../../../../../../services/kpi.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of, Subject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { KpiTableUserAverageDurationForTransferDelayComponent } from '../kpi-table-user-average-duration-for-transfer-delay/kpi-table-user-average-duration-for-transfer-delay.component';
import { KpiChartStructureAverageDurationForTransferDelayComponent } from '../kpi-chart-structure-average-duration-for-transfer-delay/kpi-chart-structure-average-duration-for-transfer-delay.component';
import { CardsVisibility } from '../../../../../../models/cards-visibility';

@Component({
  selector: 'app-kpi-table-average-duration-for-transfer-delay',
  templateUrl: './kpi-table-average-duration-for-transfer-delay.component.html',
  styleUrls: ['./kpi-table-average-duration-for-transfer-delay.component.css'],
  imports: [
    CommonModule,
    DataTablesModule,
    NgbModule,
    FormsModule,
    TranslateModule,
    KpiChartStructureAverageDurationForTransferDelayComponent,
    KpiTableUserAverageDurationForTransferDelayComponent
  ]
})
export class KpiTableAverageDurationForTransferDelayComponent implements OnInit {
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


  selectedUser: any = null;

  // i use this variable in the showUserPerStructure to update the function 'because in the another component i detect the chnages only'
  // in case i hide the table and click again on the structure name will change the value of the componentLey and the changes will updated on the another component
  componentKey: number = 0;

  selectedStrutureId: number | null = null
  selectedYear: number | null = null;
  selectedAverage!: number;
  isPerformanceCardVisible: boolean = true;
  isAveragePerUserVisible: boolean = true;


  isChartVisible: boolean = true;
  selectedChartStrutureId: number | null = null
  selectedChartYear: number | null = null;

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

  private loadData(): void {
    if (!this.year) {
      console.warn('Year is not defined.');
      return;
    }

    this.kpiService.ListStructureAverageDurationForTransferDelay(this.year).pipe(
      catchError(error => {
        console.error('Error fetching data:', error);
        return of({ data: [], recordsTotal: 0 });
      })
    ).subscribe(response => {
      console.log('response', response);
      this.processResponse(response);
    });
  }

  private processResponse(response: any): void {
    if (!response || !Array.isArray(response.data)) {
      console.warn('Invalid response structure:', response);
      return;
    }

    const structureIds = response.data.map((item: any) => item.structureId);
    const structuresRequests = structureIds.map((id: number) => this.kpiService.GetStructureById(id));

    forkJoin<any[]>(structuresRequests).subscribe((structures: any) => {
      this.data = response.data.map((item: any, index: number) => ({
        ...item,
        structureName: structures[index]?.name,
        structureId: item.structureId
      }));
    });

    this.totalItems = response.recordsTotal;
    this.calculatePagination();
    this.dtTrigger.next(null);
  }


  getTotalAverage() {
    this.kpiService
      .GetAverageDurationForTransferDelay(this.year)
      .subscribe((res: any) => {
        this.totalAverage = res.totalAverage.toFixed(2);
        console.log('Total Average:', this.totalAverage);
      });
  }

  drawStructureUserTable(type: string, average: number, year: number, userId: number | null, structureId: number) {
    // Implement the logic to draw the structure user table
    console.log(`Drawing table for ${type} with average ${average}, year ${year}, userId ${userId}, structureId ${structureId}`);

    const selectedUser = this.data.find(item => item.structureId === structureId && item.userId === userId);
    if (selectedUser) {
      this.selectedUser = selectedUser;
    }
  }

  openStructureChart(type: string, average: number, year: number, userId: number | null, structureId: number) {
    // Implement the logic to open the structure chart
    console.log(`Opening chart for ${type} with average ${average}, year ${year}, userId ${userId}, structureId ${structureId}`);

    this.selectedChartStrutureId = structureId;
    this.selectedChartYear = year;
    this.isChartVisible = true;
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
    if ((page === 1 && this.currentPage === 1) || (page === this.totalPages && this.currentPage === this.totalPages)) {
      return;
    }
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadData();
    }
  }

  
  showUserPerStructure(structureId: number, year: number, average: number) {
    this.selectedStrutureId = structureId;
    this.selectedYear = year;
    this.selectedAverage = average;
    this.componentKey++;

    this.isAveragePerUserVisible = true;
    this.isPerformanceCardVisible = true;

  }

  onChartVisibilityChanged(isVisible: boolean) {
    this.isChartVisible = isVisible;
  }

  onCardsVisibilityChanged(isCardsVisible: CardsVisibility) {
    this.isPerformanceCardVisible = isCardsVisible.isPerformanceCardVisible
    this.isAveragePerUserVisible = isCardsVisible.isAverageDurationCardVisible
  }

  getDifferenceFormatted(value: number, total: number): { text: string, isPositive: boolean } {
    const diff = (value - total).toFixed(2);
    return {
      text: parseFloat(diff) > 0 ? `+${diff}` : `${diff}`,
      isPositive: parseFloat(diff) > 0
    }

  }

}
