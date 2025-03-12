import { Component, Input, OnChanges, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { ChartsService } from '../../../../../../services/charts.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LookupsService } from '../../../../../../services/lookups.service';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-chart-system-documents-completed-overdue-and-onTime-per-category',
  templateUrl: './chart-system-documents-completed-overdue-and-onTime-per-category.component.html',
  styleUrls: ['./chart-system-documents-completed-overdue-and-onTime-per-category.component.css'],
  imports: [CommonModule, HighchartsChartModule, FormsModule, TranslateModule,MatTooltipModule]
})
export class ChartSystemDocumentsCompletedOverdueAndOnTimePerCategoryComponent implements OnInit {

  @Input() fromDate: string = '';
  @Input() toDate: string = '';
  @Input() categories: { id: number, text: string }[] = [];
  minToDate : string | null = null;
  info!:string;

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options | undefined;


  tempFromDate: string = this.fromDate; // Temporary variable for modal input
  tempToDate: string = this.toDate; // Temporary variable for modal input
  isModalOpen: boolean = false;
  isDataAvailable:boolean = false;
  private languageSubscription!: Subscription;

  constructor(
    private chartsService: ChartsService,
    private lookupsService: LookupsService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {

    this.languageSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.info = this.translateService.instant("BAM.CHARTS.DUE_DATE_COMPLETED_INFO")
      this.loadChartData();
    });
    // Only load chart data when categories are available
    if (this.categories && this.categories.length > 0) {
      this.loadChartData();
    }
  }

  ngOnChanges() {
    // Reload chart data whenever categories input changes and is not empty
    if (this.categories && this.categories.length > 0) {
      this.loadChartData();
    }
  }

  private loadChartData() {
    this.info = this.translateService.instant("BAM.CHARTS.DUE_DATE_COMPLETED_INFO")
    this.chartsService
      .GetDocumentsCompletedOverdueAndOnTimePerCategory({
        fromDate: this.fromDate,
        toDate: this.toDate,
        structureIds: undefined,
      })
      .subscribe((res: { overDue: any[]; onTime: any[] }) => {
        const categoryNames: string[] = [];
        const overdueData: number[] = [];
        const onTimeData: number[] = [];

        this.categories.forEach(cat => {
          const overdueItem = res.overDue.find(item => item.categoryId === cat.id) || { count: 0 };
          const onTimeItem = res.onTime.find(item => item.categoryId === cat.id) || { count: 0 };

          if (onTimeItem.count > 0) {
            categoryNames.push(cat.text);
            onTimeData.push(onTimeItem.count);
            this.isDataAvailable = true;
          }
          if(overdueItem.count > 0){
            categoryNames.push(cat.text);
            overdueData.push(overdueItem.count);
            this.isDataAvailable  = true;
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
          
          this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.INTERNAL"),
          this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.INCOMING"),
          this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.COMPLETED"),
          this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.IN_PROGRESS"),
          this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.OVERDUE"),
          this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.OUTGOING"),
          this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.FOLLOW_UP"),
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
          text: this.translateService.instant('BAM.CHARTS.LABELS.DOCUMENT_COUNT')
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
    this.fromDate = this.tempFromDate;
    this.toDate = this.tempToDate;
    this.loadChartData();
    this.toggleModal();
  }

  onFromDateChange() {
    console.log(this.tempFromDate);
    if (this.tempFromDate) {
      let fromDate = new Date(this.tempFromDate);
      fromDate.setDate(fromDate.getDate());
      
      this.minToDate = fromDate.toISOString().split('T')[0];
    } else {
      this.minToDate = null;
    }
  }


}
