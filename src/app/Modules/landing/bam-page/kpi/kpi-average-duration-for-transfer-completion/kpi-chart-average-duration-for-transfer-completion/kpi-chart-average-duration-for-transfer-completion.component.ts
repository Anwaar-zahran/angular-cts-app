import { Component, OnInit, Input } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KpiService } from '../../../../../../services/kpi.service';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-kpi-chart-average-duration-for-transfer-completion',
  templateUrl: './kpi-chart-average-duration-for-transfer-completion.component.html',
  styleUrls: ['./kpi-chart-average-duration-for-transfer-completion.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    NgbModalModule,
    HighchartsChartModule,
    TranslateModule
  ]
})
export class KpiChartAverageDurationForTransferCompletionComponent implements OnInit {
  @Input() year!: number;
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options | undefined;
  isModalOpen: boolean = false;
  languageSubscription!: Subscription;

  constructor(
    private kpiService: KpiService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.languageSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
          this.loadChartData();
        });
        
    this.loadChartData();
  }

  ngOnChanges() {
    this.loadChartData();
  }

  private loadChartData() {
    this.kpiService
      .GetAverageDurationForTransferCompletion(this.year)
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
            text: this.translateService.instant('BAM.KPI.TRANSFER_DURATION.CHART.TOTAL_AVERAGE', {
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
              text: this.translateService.instant('BAM.KPI.TRANSFER_DURATION.CHART.AVERAGE_DAYS')
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
            name: this.translateService.instant('BAM.KPI.TRANSFER_DURATION.CHART.ALL_CATEGORIES'),
            type: 'line',
            data: dataPoints.map(num => parseFloat(num.toFixed(2)))
          }]
        };
      });
  }

  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
  }
}
