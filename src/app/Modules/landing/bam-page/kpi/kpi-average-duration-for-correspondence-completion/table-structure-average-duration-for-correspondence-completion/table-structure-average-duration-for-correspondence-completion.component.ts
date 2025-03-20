import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { KpiService } from '../../../../../../services/kpi.service';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { DataTableDirective } from 'angular-datatables';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AveragePerUserComponent } from '../../average-per-user/average-per-user.component';
import { TableUserAverageDurationForCorrespondenceCompletionComponent } from '../table-user-average-duration-for-correspondence-completion/table-user-average-duration-for-correspondence-completion.component';
import { ChartStructureAverageDurationForCorrespondenceCompletionComponent } from "../chart-structure-average-duration-for-correspondence-completion/chart-structure-average-duration-for-correspondence-completion.component";
import { CardsVisibility } from '../../../../../../models/cards-visibility';

@Component({
  selector: 'app-table-structure-average-duration-for-correspondence-completion',
  templateUrl: './table-structure-average-duration-for-correspondence-completion.component.html',
  styleUrls: ['./table-structure-average-duration-for-correspondence-completion.component.css'],
  imports: [
    CommonModule,
    DataTablesModule,
    NgbModule,
    FormsModule,
    TranslateModule,
    TableUserAverageDurationForCorrespondenceCompletionComponent,
    ChartStructureAverageDurationForCorrespondenceCompletionComponent
]
})
export class TableStructureAverageDurationForCorrespondenceCompletionComponent implements OnInit {
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  data: any[] = [];
  totalAverage: number = 0;
  @Input() year!: number;
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
  totalAveragePerStructure!:number;

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
    this.getTotalAverage();
    this.initDtOptions();
    this.loadData();

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
        emptyTable: "",
        zeroRecords: "",
        info: "",
        infoEmpty: "",
        paginate: {
          first: this.translateService.instant('BAM.COMMON.PAGINATION.FIRST'),
          previous: this.translateService.instant('BAM.COMMON.PAGINATION.PREVIOUS'),
          next: this.translateService.instant('BAM.COMMON.PAGINATION.NEXT'),
          last: this.translateService.instant('BAM.COMMON.PAGINATION.LAST')
        }
      },
      dom: "t",
      ordering: false
    };
  }

  private loadData() {
    this.kpiService.ListStructureAverageDurationForCorrespondenceCompletion(this.year).subscribe((response: any) => {
      // Map the data to include both structureId and structureName
      this.data = response.data.map((item: any) => {
        const entity = this.entities.find(e => e.id === item.structureId);
        return {
          ...item,
          structureName: entity ? entity.name : this.translateService.instant('BAM.COMMON.UNKNOWN_STRUCTURE'),
          structureId: item.structureId
        };
      });
      this.totalItems = response.recordsTotal;
      this.calculatePagination();
      this.dtTrigger.next(null);
    });
  }

  getTotalAverage() {
    this.kpiService
      .GetAverageDurationForCorrespondenceCompletion(this.year)
      .subscribe((res: any) => {
        this.totalAverage = res.totalAverage;
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
    this.totalAveragePerStructure = average;
    console.log(this.totalAveragePerStructure)
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

  showUserPerStructure(structureId: number, year: number, average:number){
    this.selectedStrutureId = structureId;
    this.selectedYear = year;
    this.selectedAverage = average;
    this.componentKey++;
    this.totalAveragePerStructure = average;
    console.log('------------------------------')
    console.log(this.totalAveragePerStructure)
    this.isAveragePerUserVisible = true;
    this.isPerformanceCardVisible = true;
  }

  onChartVisibilityChanged(isVisible: boolean) {
    this.isChartVisible = isVisible;
    console.log("Chart visibility changed:", isVisible);
  }

  onCardsVisibilityChanged(isCardsVisible: CardsVisibility) {
    this.isPerformanceCardVisible = isCardsVisible.isPerformanceCardVisible
    this.isAveragePerUserVisible = isCardsVisible.isAverageDurationCardVisible
    console.log(this.isAveragePerUserVisible)
    console.log(this.isPerformanceCardVisible)
  }
}
