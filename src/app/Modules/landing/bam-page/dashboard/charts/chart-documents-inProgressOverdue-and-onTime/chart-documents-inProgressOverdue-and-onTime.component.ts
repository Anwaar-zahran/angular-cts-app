import { Component, Input, OnInit, OnChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { ChartsService } from '../../../../../../services/charts.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LookupsService } from '../../../../../../services/lookups.service';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chart-documents-inProgressOverdue-and-onTime',
  templateUrl: './chart-documents-inProgressOverdue-and-onTime.component.html',
  styleUrls: ['./chart-documents-inProgressOverdue-and-onTime.component.css'],
  imports: [CommonModule, HighchartsChartModule, FormsModule, TranslateModule]
})
export class ChartDocumentsInProgressOverdueAndOnTimeComponent implements OnInit, OnChanges {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options | undefined;

  @Input() fromDate: string = '';
  @Input() toDate: string = '';
  @Input() categories: { id: number, text: string }[] = [];
  minToDate:string | null = null;

  tempFromDate: string = this.fromDate; // Temporary variable for modal input
  tempToDate: string = this.toDate; // Temporary variable for modal input
  isModalOpen: boolean = false;
  private languageSubscription! : Subscription

  constructor(
    private chartsService: ChartsService,
    private lookupsService: LookupsService,
    private translate: TranslateService
  ) { }

  ngOnInit() {

    this.languageSubscription = this.translate.onLangChange.subscribe((event:LangChangeEvent) =>{
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
    this.chartsService
      .GetDocumentsInProgressOverdueAndOnTimePerCategoryByUser({
        fromDate: this.fromDate,
        toDate: this.toDate,
        structureId:  localStorage.getItem('structureId') || "1",
      })
      .subscribe((res: { overDue: any[]; onTime: any[] }) => {
        const categoryNames: string[] = [];
        const overdueData: number[] = [];
        const onTimeData: number[] = [];
        console.log('categories', this.categories);
        this.categories.forEach(cat => {
          const overdueItem = res.overDue.find(item => item.categoryId === cat.id) || { count: 0 };
          const onTimeItem = res.onTime.find(item => item.categoryId === cat.id) || { count: 0 };

          if (overdueItem.count > 0 || onTimeItem.count > 0) {
            categoryNames.push(cat.text);
            overdueData.push(overdueItem.count);
            onTimeData.push(onTimeItem.count);
          }
        });

        this.drawChart(categoryNames, overdueData, onTimeData);
      });
  }

  private drawChart(categories: string[], overdueData: number[], onTimeData: number[]) {
    this.chartOptions = {
      chart: {
        type: 'column'
      },
      title: {
        text: ''
      },
      colors: ['#003B82', '#00695E', '#DEF5FF', '#8D0034', '#0095DA', '#3ABB9D'],
      xAxis: {
        categories:  [
          this.translate.instant("BAM.DASHBOARD.CHARTS.STATUS.INTERNAL"),
          this.translate.instant("BAM.DASHBOARD.CHARTS.STATUS.INCOMING"),
          this.translate.instant("BAM.DASHBOARD.CHARTS.STATUS.IN_PROGRESS"),
          this.translate.instant("BAM.DASHBOARD.CHARTS.STATUS.COMPLETED"),
          this.translate.instant("BAM.DASHBOARD.CHARTS.STATUS.FOLLOW_UP"),
          this.translate.instant("BAM.DASHBOARD.CHARTS.STATUS.OUTGOING"),
        ],
        title: {
          text: this.translate.instant('BAM.CHARTS.LABELS.CATEGORY')
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: this.translate.instant('BAM.CHARTS.LABELS.COUNT')
        }
      },
      tooltip: {
        shared: true,
        pointFormat: `<b>{series.name}</b>: {point.y} ${this.translate.instant('BAM.CHARTS.LABELS.COUNT')}<br/>`
      },
      plotOptions: {
        column: {
          borderRadius: 4,
          dataLabels: {
            enabled: true
          }
        }
      },
      series: [
        {
          name: this.translate.instant('BAM.DASHBOARD.CHARTS.LABELS.OVERDUE'),
          type: 'column',
          data: overdueData,
          color: '#8D0034' // Red
        },
        {
          name:  this.translate.instant('BAM.DASHBOARD.CHARTS.LABELS.ON_TIME'),
          type: 'column',
          data: onTimeData,
          color: '#00695E' // Green
        }
      ]
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
