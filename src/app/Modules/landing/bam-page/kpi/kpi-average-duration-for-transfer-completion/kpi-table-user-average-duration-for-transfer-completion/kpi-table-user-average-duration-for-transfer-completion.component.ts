import { Component, EventEmitter, Input, Output, ChangeDetectorRef, SimpleChanges, OnChanges } from '@angular/core';
import { CardsVisibility } from '../../../../../../models/cards-visibility';
import { KpiService } from '../../../../../../services/kpi.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UserPerStructure } from '../../../../../../models/user-per-structure';

@Component({
  selector: 'app-kpi-table-user-average-duration-for-transfer-completion',
  imports: [
    CommonModule,
    TranslateModule
  ],
  templateUrl: './kpi-table-user-average-duration-for-transfer-completion.component.html',
  styleUrl: './kpi-table-user-average-duration-for-transfer-completion.component.scss'
})
export class KpiTableUserAverageDurationForTransferCompletionComponent implements OnChanges {

  @Input() structureId!: number;
  @Input() year!: number;
  @Input() average!: number;
  @Input() key!: number;
  @Input() totalAverage!: number;
  @Input() isPerformanceCardVisible: boolean = true;
  @Input() isAverageDurationCardVisible: boolean = true;
  @Output() CardVisibilityChanged = new EventEmitter<boolean>();
  @Output() CardVisibilityCheck = new EventEmitter<CardsVisibility>();

  public structureName!: string;

  bestPerformanceUSer: UserPerStructure | null = null;
  worstPerformanceUser: UserPerStructure | null = null;

  cardsVisibility: CardsVisibility = { isAverageDurationCardVisible: true, isPerformanceCardVisible: true };

  // isAverageDurationCardVisible: boolean = true;
  // isPerformanceCardVisible: boolean = true;

  dtOptions: any = {};


  public userPerStructure: UserPerStructure[] = [];
  comparasion!: number;
  compareStructureTotalAverage:number[] = []
  compareTotalAverage:number[] = []


  constructor(
    private kpiService: KpiService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService
  ) { 
    console.log(this.compareStructureTotalAverage)
    console.log(this.compareTotalAverage)
  }


  // ngOnInit() {
  //   this.initDtOptions(); 
  //   this.loadData();   
  // }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['structureId'] || changes['year'] || changes['key'] || changes['isAverageDurationCardVisible'] || changes['isPerformanceCardVisible']) {
      
      this.compareStructureTotalAverage =[]
      this.compareTotalAverage =[]
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

    this.kpiService.ListUserStructureAverageDurationForTransferCompletion(this.structureId, this.year).subscribe({
      next: (response) => {
        console.log(response.data);
        let data = response.data;

        if (Array.isArray(data) && data.length > 0) {
          const requests = data.map(user =>
            this.kpiService.GetUserById(user.userId).pipe(
              map(resp => ({
                userName: resp.fullName,
                average: user.average
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
}
