import { Component, EventEmitter, Input, Output, ChangeDetectorRef, SimpleChanges, OnChanges } from '@angular/core';
import { CardsVisibility } from '../../../../../../models/cards-visibility';
import { KpiService } from '../../../../../../services/kpi.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { KpiChartUserAverageDurationForTransferDelayComponent } from '../kpi-chart-user-average-duration-for-transfer-delay/kpi-chart-user-average-duration-for-transfer-delay.component';



interface userPerStructure {
  userId: number,
  userName: string,
  average: number,
  compareToStructureAverage?: number; // Added for comparison
  compareToTotalAverage?: number;
}

@Component({
  selector: 'app-kpi-table-user-average-duration-for-transfer-delay',
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    KpiChartUserAverageDurationForTransferDelayComponent
  ],
  templateUrl: './kpi-table-user-average-duration-for-transfer-delay.component.html',
  styleUrl: './kpi-table-user-average-duration-for-transfer-delay.component.scss'
})
export class KpiTableUserAverageDurationForTransferDelayComponent implements OnChanges {

  @Input() structureId!: number;
  @Input() year!: number;
  @Input() average!: number;
  @Input() key!: number;
  @Input() totalAverage!: number;
  @Input() isPerformanceCardVisible: boolean = true;
  @Input() isAverageDurationCardVisible: boolean = true;
  @Output() CardVisibilityChanged = new EventEmitter<boolean>();
  @Output() CardVisibilityCheck = new EventEmitter<CardsVisibility>();


  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  totalItems: number = 0;
  startIndex: number = 0;
  endIndex: number = 0;
  pages: number[] = [];

  public structureName!: string;

  selectedUserId!: number;
  selectedChartStrutureId: number | null = null
  selectedChartYear: number | null = null;
  isChartVisible: boolean = true;

  bestPerformanceUSer: userPerStructure | null = null;
  worstPerformanceUser: userPerStructure | null = null;

  cardsVisibility: CardsVisibility = { isAverageDurationCardVisible: true, isPerformanceCardVisible: true };

  // isAverageDurationCardVisible: boolean = true;
  // isPerformanceCardVisible: boolean = true;

  dtOptions: any = {};


  public userPerStructure: userPerStructure[] = [];
  comparasion!: number;
  compareStructureTotalAverage: number[] = []
  compareTotalAverage: number[] = []


  constructor(
    private kpiService: KpiService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService
  ) { }


  // ngOnInit() {
  //   this.initDtOptions(); 
  //   this.loadData();   
  // }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['structureId'] || changes['year'] || changes['key'] || changes['isAverageDurationCardVisible'] || changes['isPerformanceCardVisible']) {
      this.compareStructureTotalAverage = []
      this.compareTotalAverage = []
      this.isChartVisible= false;
      this.initDtOptions();
      this.loadData();

      this.isAverageDurationCardVisible = true;
      this.isPerformanceCardVisible = true;

      this.cdr.detectChanges();
    }

    // Detect changes for visibility flags
    if (changes['isAverageDurationCardVisible']) {
      console.log('isAverageDurationCardVisible changed:', changes['isAverageDurationCardVisible'].currentValue);
    }

    if (changes['isPerformanceCardVisible']) {
      console.log('isPerformanceCardVisible changed:', changes['isPerformanceCardVisible'].currentValue);
    }
  }




  private initDtOptions() {
    this.translate.get('COMMON.DATATABLE').subscribe(translations => {
      this.dtOptions = {
        pageLength: 5,
        pagingType: 'full_numbers',
        paging: true,
        searching: false,
        autoWidth: false,
        language: {
          paginate: {
            first: "<i class='text-secondary fa fa-angle-double-left'></i>",
            previous: "<i class='text-secondary fa fa-angle-left'></i>",
            next: "<i class='text-secondary fa fa-angle-right'></i>",
            last: "<i class='text-secondary fa fa-angle-double-right'></i>",
          },
        },
        dom: 'tp',
        drawCallback: (settings: any) => {
          const api = settings.oInstance.api();
          const pageInfo = api.page.info();
          const pagination = $(api.table().container()).find('.dataTables_paginate');
          pagination.find('input.paginate-input').remove();

          const page = $('<span class="d-inline-flex align-items-center mx-2">' + this.translate.instant('COMMON.PAGE') + '<input type="number" class="paginate-input form-control form-control-sm mx-2" min="1" max="' + pageInfo.pages + '" value="' + (pageInfo.page + 1) + '"> ' + this.translate.instant('COMMON.OF') + ' ' + pageInfo.pages + '</span>');

          let timeout: any;
          page.find('input').on('keyup', function () {
            clearTimeout(timeout);

            timeout = setTimeout(() => {
              const pageNumber = parseInt($(this).val() as string, 10);
              if (pageNumber >= 1 && pageNumber <= pageInfo.pages) {
                api.page(pageNumber - 1).draw('page');
              }
            }, 500);
          });

          const previous = pagination.find('.previous');
          const next = pagination.find('.next');
          page.insertAfter(previous);
          next.insertAfter(page);

          pagination.find('a.paginate_button').on('click', function () {
            page.find('input').val(api.page() + 1);
          });
        }
      };
    });
  }

  loadData() {
    this.userPerStructure = [];

    this.kpiService.ListUserStructureAverageDurationForTransferDelay(this.structureId, this.year).subscribe({
      next: (response) => {
        console.log(response.data);
        let data = response.data;

        if (Array.isArray(data) && data.length > 0) {
          const requests = data.map(user =>
            this.kpiService.GetUserById(user.userId).pipe(
              map(resp => ({
                userName: resp.fullName,
                average: user.average,
                userId: user.userId
              }))
            )
          );

          forkJoin(requests).subscribe({
            next: (users) => {
              this.userPerStructure = users;
              console.log('Final userPerStructure:', this.userPerStructure);

              // Call the method here after userPerStructure is populated
              this.getBestAndWorstPerformance();
            },
            error: (error) => console.error('Error fetching user data:', error),
          });
        } else {
          this.userPerStructure = [];
        }
      },
      error: (error) => {
        console.error(error);
      },
    });

    this.kpiService.GetStructureById(this.structureId).subscribe({
      next: (Response) => {
        this.structureName = Response.name;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }


  getBestAndWorstPerformance() {
    if (this.userPerStructure.length === 0) return;

    this.bestPerformanceUSer = this.userPerStructure[0];
    this.worstPerformanceUser = this.userPerStructure[0];

    console.log(this.worstPerformanceUser)
    this.userPerStructure.forEach(user => {
      if (user.average < this.bestPerformanceUSer!.average) {
        this.bestPerformanceUSer = user;
      }
      if (user.average > this.worstPerformanceUser!.average) {
        this.worstPerformanceUser = user;
      }
    });
  }



  hideAverageDurationCard() {
    this.isAverageDurationCardVisible = false;
    this.cardsVisibility.isAverageDurationCardVisible = this.isAverageDurationCardVisible
    this.cardsVisibility.isPerformanceCardVisible = this.isPerformanceCardVisible;

    this.CardVisibilityCheck.emit(this.cardsVisibility);
    console.log(this.cardsVisibility)

  }

  hidePerformanceCard() {
    this.isPerformanceCardVisible = false;
    this.cardsVisibility.isAverageDurationCardVisible = this.isAverageDurationCardVisible
    this.cardsVisibility.isPerformanceCardVisible = this.isPerformanceCardVisible;
    this.CardVisibilityCheck.emit(this.cardsVisibility);
    console.log(this.cardsVisibility)
  }

  getTotalAveragePerStructure(itemaverage: number, totalAverage: number) {
    this.comparasion = Number((itemaverage - totalAverage).toFixed(2));
    this.compareStructureTotalAverage.push(this.comparasion);
    // Find the maximum value in the array
    const maxValue = Math.max(...this.compareStructureTotalAverage);

    return {
      value: this.comparasion > 0 ? `+${this.comparasion}` : `${this.comparasion}`,
      class: this.comparasion === maxValue ? 'text-danger' : 'text-success'
    };
  }

  getTotalAverage(itemaverage: number, totalAverage: number) {
    this.comparasion = Number((itemaverage - totalAverage).toFixed(2));
    this.compareTotalAverage.push(this.comparasion);

    // Find the maximum value in the array
    const maxValue = Math.max(...this.compareTotalAverage);

    return {
      value: this.comparasion > 0 ? `+${this.comparasion}` : `${this.comparasion}`,
      class: this.comparasion === maxValue ? 'text-danger' : 'text-success'
    };
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

  openUserChart(type: string, average: number, year: number, userId: number, structureId: number) {
    // Implement the logic to open the structure chart
    console.log(`Opening chart for ${type} with average ${average}, year ${year}, userId ${userId}, structureId ${structureId}`);

    this.selectedChartStrutureId = structureId;
    this.selectedChartYear = year;
    this.selectedUserId = userId;
    this.isChartVisible = true;
  }

  onChartVisibilityChanged(isVisible: boolean) {
    this.isChartVisible = isVisible;
    console.log("Chart visibility changed:", isVisible);
  }
}
