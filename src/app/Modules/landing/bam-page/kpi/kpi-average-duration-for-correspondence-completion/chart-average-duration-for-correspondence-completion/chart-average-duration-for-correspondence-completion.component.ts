import { Component, OnInit, Input, OnChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KpiService } from '../../../../../../services/kpi.service';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chart-average-duration-for-correspondence-completion',
  templateUrl: './chart-average-duration-for-correspondence-completion.component.html',
  styleUrls: ['./chart-average-duration-for-correspondence-completion.component.css'],
  imports: [CommonModule, HighchartsChartModule, FormsModule, TranslateModule]
})
export class ChartAverageDurationForCorrespondenceCompletionComponent implements OnInit, OnChanges {

  @Input() year!: number;
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options | undefined;
  isModalOpen: boolean = false;
  private langChangeSubscription!: Subscription;

  constructor(
    private kpiService: KpiService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.loadChartData();

    this.langChangeSubscription = this.translateService.onLangChange.subscribe((event:LangChangeEvent) => {
      this.loadChartData();
    });}

  ngOnChanges() {
    this.loadChartData();
  }

  private loadChartData() {
    this.kpiService
      .GetAverageDurationForCorrespondenceCompletion(this.year)
      .subscribe((res: any) => {
        const monthLabels = [
          this.translateService.instant('BAM.MONTHS.JAN'),
          this.translateService.instant('BAM.MONTHS.FEB'),
          this.translateService.instant('BAM.MONTHS.MAR'),
          this.translateService.instant('BAM.MONTHS.APR'),
          this.translateService.instant('BAM.MONTHS.MAY'),
          this.translateService.instant('BAM.MONTHS.JUN'),
          this.translateService.instant('BAM.MONTHS.JUL'),
          this.translateService.instant('BAM.MONTHS.AUG'),
          this.translateService.instant('BAM.MONTHS.SEP'),
          this.translateService.instant('BAM.MONTHS.OCT'),
          this.translateService.instant('BAM.MONTHS.NOV'),
          this.translateService.instant('BAM.MONTHS.DEC')
        ];


        console.log(this.translateService.instant('BAM.MONTHS.NOV'));


        const dataPoints = Array(12).fill(0);
        res.documentAverageDurationList.forEach((item: any) => {
          const monthIndex = parseInt(item.month, 10) - 1;
          if (monthIndex >= 0 && monthIndex < 12) {
            dataPoints[monthIndex] = item.average;
          }
        });

        const isRTL = document.dir === 'rtl';
        this.chartOptions = {
          chart: {
            type: 'line'
          },
          title: {
            text: ''
          },
          colors: ['#003B82', '#00695E', '#DEF5FF', '#8D0034', '#0095DA', '#3ABB9D'],
          subtitle: {
            text: this.translateService.instant('BAM.KPI.AVERAGE_DURATION.TOTAL_AVERAGE', {
              days: res.totalAverage.toFixed(2)
            }),
          },
          xAxis: {
            categories: monthLabels,
            title: {
              text: null
            },
            reversed: isRTL,
          },
          yAxis: {
            title: {
              text: this.translateService.instant('BAM.KPI.AVERAGE_DURATION.AVERAGE_DAYS')
            },
            min: 0,
            reversed: false,
            opposite: isRTL,
          },
          tooltip: {
            valueSuffix: ' ' + this.translateService.instant('BAM.COMMON.DAYS'),
            shared: true,
            formatter: function () {
              return `${this.series.name}: <b>${this.y?.toFixed(2)} ${this.series.chart.tooltip.options.valueSuffix}</b>`;
            },
            style: {
              textAlign: isRTL ? 'right' : 'left'
            }
          },
          plotOptions: {
            series: {
              stacking: undefined
            },
            line: {
              dataLabels: {
                enabled: true
              },
              enableMouseTracking: true,
              marker: {
                enabled: true,
                radius: 4
              }
            }
          },
          legend: {
            layout: 'horizontal',
            align: 'right',
            verticalAlign: 'bottom',
            rtl: isRTL
          },
          credits: {
            enabled: false
          },
          series: [{
            name: this.translateService.instant('BAM.KPI.AVERAGE_DURATION.ALL_CATEGORIES'),
            type: 'line',
            data: dataPoints
          }]
        };
      });
  }

  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
  }
}
