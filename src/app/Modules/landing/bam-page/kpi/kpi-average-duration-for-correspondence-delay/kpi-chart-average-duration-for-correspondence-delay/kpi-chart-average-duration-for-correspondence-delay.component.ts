import { Component, OnInit, Input } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KpiService } from '../../../../../../services/kpi.service';


@Component({
  selector: 'app-kpi-chart-average-duration-for-correspondence-delay',
  templateUrl: './kpi-chart-average-duration-for-correspondence-delay.component.html',
  styleUrls: ['./kpi-chart-average-duration-for-correspondence-delay.component.css'],
  standalone: true,
  imports: [CommonModule, HighchartsChartModule, FormsModule],
})
export class KpiChartAverageDurationForCorrespondenceDelayComponent implements OnInit {

  @Input() year!: number;
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options | undefined;
  isModalOpen: boolean = false;

  constructor(private kpiService: KpiService) { }

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
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
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
          subtitle: {
            text: `Total Average: ${res.totalAverage.toFixed(2)} day(s)`,
          },
          xAxis: {
            categories: monthLabels,
            title: {
              text: null
            }
          },
          yAxis: {
            title: {
              text: 'Average (Days)'
            },
            min: 0
          },
          tooltip: {
            valueSuffix: ' days',
            shared: true,
            formatter: function () {
              return `${this.series.name}: <b>${this.y?.toFixed(2)} days</b>`;
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
            name: 'All categories',
            type: 'line',
            data: dataPoints,
            color: '#8A2BE2'
          }]
        };
      });
  }

  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
  }

}
