import { Component, OnInit, Input } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KpiService } from '../../../../../../services/kpi.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-kpi-chart-average-duration-for-correspondence-delay',
  templateUrl: './kpi-chart-average-duration-for-correspondence-delay.component.html',
  styleUrls: ['./kpi-chart-average-duration-for-correspondence-delay.component.css'],
  imports: [CommonModule, HighchartsChartModule, FormsModule, TranslateModule]
})
export class KpiChartAverageDurationForCorrespondenceDelayComponent implements OnInit {

  @Input() year!: number;
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options | undefined;
  isModalOpen: boolean = false;

  constructor(
    private kpiService: KpiService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.loadChartData();
  }

  ngOnChanges() {
    this.loadChartData();
  }

  private loadChartData() {
    this.kpiService
      .GetAverageDurationForCorrespondenceDelay(this.year)
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

        this.chartOptions = {
          chart: {
            type: 'line'
          },
          title: {
            text: ''
          },
          colors: ['#003B82', '#00695E', '#DEF5FF', '#8D0034', '#0095DA', '#3ABB9D'],
          subtitle: {
            text: this.translateService.instant('BAM.KPI.DELAY_DURATION.CHART.TOTAL_AVERAGE', {
              days: res.totalAverage.toFixed(2)
            }),
          },
          xAxis: {
            categories: monthLabels,
            title: {
              text: null
            }
          },
          yAxis: {
            title: {
              text: this.translateService.instant('BAM.KPI.DELAY_DURATION.CHART.AVERAGE_DAYS')
            },
            min: 0
          },
          tooltip: {
            valueSuffix: ' ' + this.translateService.instant('BAM.COMMON.DAYS'),
            shared: true,
            formatter: function () {
              return `${this.series.name}: <b>${this.y?.toFixed(2)} ${this.series.chart.tooltip.options.valueSuffix}</b>`;
            }
          },
          plotOptions: {
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
            verticalAlign: 'bottom'
          },
          credits: {
            enabled: false
          },
          series: [{
            name: this.translateService.instant('BAM.KPI.DELAY_DURATION.CHART.ALL_CATEGORIES'),
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
