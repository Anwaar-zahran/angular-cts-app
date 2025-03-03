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
  selector: 'app-chart-system-transfers-completed-overdue-and-onTime-per-category',
  templateUrl: './chart-system-transfers-completed-overdue-and-onTime-per-category.component.html',
  styleUrls: ['./chart-system-transfers-completed-overdue-and-onTime-per-category.component.css'],
  imports: [CommonModule, HighchartsChartModule, FormsModule, TranslateModule]
})
export class ChartSystemTransfersCompletedOverdueAndOnTimePerCategoryComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options | undefined;

  @Input() fromDate: string = '';
  @Input() toDate: string = '';
  @Input() categories: { id: number, text: string }[] = [];
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

    this.languageSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
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
      .GetTransfersCompletedOverdueAndOnTimePerCategory({
        fromDate: this.fromDate,
        toDate: this.toDate,
        structureIds: this.categories.map(cat => cat.id.toString()),
      })
      .subscribe((res: { overDue: any[]; onTime: any[] }) => {
        const categoryNames: string[] = [];
        const overdueData: number[] = [];
        const onTimeData: number[] = [];

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
        categories: [
          this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.INCOMING"),
          this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.OUTGOING"),
          this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.INTERNAL"),
          this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.FOLLOW_UP")
        ],
        title: {
          text: this.translateService.instant('BAM.DASHBOARD.CHARTS.LABELS.CATEGORIES')
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: this.translateService.instant('BAM.DASHBOARD.CHARTS.LABELS.DOCUMENT_COUNT')
        }
      },
      tooltip: {
        shared: true,
        pointFormat: '<b>{series.name}</b>: {point.y} ' +
          this.translateService.instant('BAM.DASHBOARD.CHARTS.LABELS.TRANSFERS') + '<br/>'
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
          name: this.translateService.instant('BAM.DASHBOARD.CHARTS.LABELS.OVERDUE'),
          type: 'column',
          data: overdueData,
          color: '#8D0034'
        },
        {
          name: this.translateService.instant('BAM.DASHBOARD.CHARTS.LABELS.ON_TIME'),
          type: 'column',
          data: onTimeData,
          color: '#00695E'
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
    this.chartOptions = undefined;
    this.fromDate = this.tempFromDate;
    this.toDate = this.tempToDate;
    this.loadChartData();
    this.toggleModal();
  }


}
