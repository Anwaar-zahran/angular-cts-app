import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';

@Component({
  selector: 'app-average-per-user',
  templateUrl: './average-per-user.component.html',
  styleUrls: ['./average-per-user.component.scss'],
  imports: [
    CommonModule,
    DataTablesModule,
    NgbModule,
    FormsModule,
    TranslateModule,
  ]
})
export class AveragePerUserComponent implements OnInit {
  @Input() user: any; 

  data: any[] = []; 
  dtOptions: any = {}; 
  isCardVisible: boolean = true;

  constructor(
    private translate: TranslateService,) {}

  ngOnInit() {
    this.initDtOptions(); 
    this.loadData();   
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

  private loadData() {
    if (this.user) {
      this.data = [
        {
          registeredBy: 'user',
          averageDays: this.user.average,
          compareToStructureAverage: '0.1',
          compareToTotalAverage: '0.5'
        },
        {
          registeredBy: 'user',
          averageDays: this.user.average,
          compareToStructureAverage: '0.1',
          compareToTotalAverage: '0.5'
        },
        
        {
          registeredBy: 'user',
          averageDays: this.user.average,
          compareToStructureAverage: '0.1',
          compareToTotalAverage: '0.5'
        },
        
        {
          registeredBy: 'user',
          averageDays: this.user.average,
          compareToStructureAverage: '0.1',
          compareToTotalAverage: '0.5'
        },
        {
          registeredBy: 'user',
          averageDays: this.user.average,
          compareToStructureAverage: '0.1',
          compareToTotalAverage: '0.5'
        },
        {
          registeredBy: 'user',
          averageDays: this.user.average,
          compareToStructureAverage: '0.1',
          compareToTotalAverage: '0.5'
        },
      ];
    } else {
      console.error('User data is missing!');
    }
  }

  hideCard() {
    this.isCardVisible = false;
  }

}
