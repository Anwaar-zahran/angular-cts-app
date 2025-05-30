import { Component, Input, OnInit, OnChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { ChartsService } from '../../../../../../services/charts.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LookupsService } from '../../../../../../services/lookups.service';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepicker, MatDatepickerInput } from '@angular/material/datepicker';



@Component({
  selector: 'app-chart-system-documents-inProgress-overdue-and-onTime-per-category',
  templateUrl: './chart-system-documents-inProgress-overdue-and-onTime-per-category.component.html',
  styleUrls: ['./chart-system-documents-inProgress-overdue-and-onTime-per-category.component.css'],
  imports: [CommonModule, HighchartsChartModule, FormsModule, TranslateModule, MatTooltipModule, MatDatepicker, MatDatepickerInput]
})
export class ChartSystemDocumentsInProgressOverdueAndOnTimePerCategoryComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options | undefined;
  info!:string;

  @Input() fromDate: string = '';
  @Input() toDate: string = '';
  @Input() categories: { id: number, text: string }[] = [];
  minToDate : string | null = null;

  tempFromDate: string = this.fromDate; // Temporary variable for modal input
  tempToDate: string = this.toDate; // Temporary variable for modal input
  isModalOpen: boolean = false;
  private languageSubscription!: Subscription;

  constructor(
    private chartsService: ChartsService,
    private lookupsService: LookupsService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {

    // this.translateService.get("BAM.CHARTS.DUE_DATE_IN_PROGRESS_INFO_V2").subscribe((translatedText: string) => {
    //   this.info = translatedText;
    // });
  

    // Only load chart data when categories are available
    if (this.categories && this.categories.length > 0) {
      this.loadChartData();
    }
  }

  ngOnChanges() {

    this.languageSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.loadChartData();
    });
    // Reload chart data whenever categories input changes and is not empty
    if (this.categories && this.categories.length > 0) {
      this.loadChartData();
    }
  }

  private loadChartData() {
    this.info = this.translateService.instant("BAM.CHARTS.DUE_DATE_IN_PROGRESS_INFO_V2");
    this.chartsService
      .GetDocumentsInProgressOverdueAndOnTimePerCategory({
        fromDate: this.fromDate,
        toDate: this.toDate,
        structureIds: undefined,
      })
      .subscribe((res: { overDue: any[]; onTime: any[] }) => {
        const categoryNames: string[] = [];
        const overdueData: number[] = [];
        const onTimeData: number[] = [];
        console.log('categories', this.categories);
        this.categories.forEach(cat => {
          const overdueItem = res.overDue.find(item => item.categoryId === cat.id) || { count: 0 };
          const onTimeItem = res.onTime.find(item => item.categoryId === cat.id) || { count: 0 };

          if (onTimeItem.count > 0) {
            categoryNames.push(cat.text);
            onTimeData.push(onTimeItem.count);
          }
          if(overdueItem.count > 0){
            categoryNames.push(cat.text);
            overdueData.push(overdueItem.count);
          }
        });

        this.drawChart(categoryNames, overdueData, onTimeData);
      });
  }

  private drawChart(categories: string[], overdueData: number[], onTimeData: number[]) {
    const isRTL = document.dir === 'rtl';
    this.chartOptions = {
      chart: {
        type: 'column'
      },
      title: {
        text: ''
      },
      colors: ['#003B82', '#00695E', '#DEF5FF', '#8D0034', '#0095DA', '#3ABB9D'],
      xAxis: {
        categories: [
          this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.COMPLETED"),
          this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.INCOMING"),
          this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.INPROGRESS"),
          this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.FOLLOW_UP"),
          this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.OUTGOING"),
          this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.INTERNAL"),
        ],
        title: {
          text: this.translateService.instant('BAM.CHARTS.LABELS.CATEGORIES')
        },
        reversed: isRTL,
      },
      yAxis: {
        min: 0,
        reversed: false,
        opposite: isRTL,
        title: {
          text: this.translateService.instant('BAM.CHARTS.LABELS.COUNT')
        }
      },
      tooltip: {
        shared: true,
        pointFormat: '<b>{series.name}</b>: {point.y} ' +
          this.translateService.instant('BAM.CHARTS.LABELS.DOCUMENTS') + '<br/>',
          style: {
            textAlign: isRTL ? 'right' : 'left'
          }
      },
      plotOptions: {
        series: {
          stacking: undefined
        },
        column: {
          borderRadius: 4,
          dataLabels: {
            enabled: true
          }
        }
      },
      series: [
        {
          name: this.translateService.instant('BAM.CHARTS.LABELS.OVERDUE'),
          type: 'column',
          data: overdueData,
          color: '#8D0034'
        },
        {
          name: this.translateService.instant('BAM.CHARTS.LABELS.ON_TIME'),
          type: 'column',
          data: onTimeData,
          color: '#00695E'
        }
      ],
      legend: {
        rtl: isRTL
      },
    };
  }

  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
    if (this.isModalOpen) {
      this.tempFromDate = this.fromDate;
      this.tempToDate = this.toDate;
    }
  }

  applyFilter() {
    this.chartOptions = undefined;
    const dateFrom = new Date(this.tempFromDate);
    const dateTo = new Date(this.tempToDate);

    // Format to yyyy-mm-dd
    this.tempFromDate = dateFrom.getFullYear() + '-'
      + String(dateFrom.getMonth() + 1).padStart(2, '0') + '-'
      + String(dateFrom.getDate()).padStart(2, '0');

    this.tempToDate = dateTo.getFullYear() + '-'
      + String(dateTo.getMonth() + 1).padStart(2, '0') + '-'
      + String(dateTo.getDate()).padStart(2, '0');
    this.fromDate = this.tempFromDate;
    this.toDate = this.tempToDate;
    this.loadChartData();
    this.toggleModal();
  }
  
  onFromDateChange() {
    console.log(this.tempFromDate);
    if (this.tempFromDate) {
      let fromDate = new Date(this.tempFromDate);
      //fromDate.setDate(fromDate.getDate());

      this.tempFromDate = fromDate.getFullYear() + '-'
        + String(fromDate.getMonth() + 1).padStart(2, '0') + '-'
        + String(fromDate.getDate()).padStart(2, '0');


      //this.minToDate = fromDate.toISOString().split('T')[0];
      this.minToDate = this.tempFromDate;
    } else {
      this.minToDate = null;
    }
  }

}
