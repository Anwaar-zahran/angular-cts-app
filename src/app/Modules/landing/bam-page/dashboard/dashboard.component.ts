import { Component } from '@angular/core';

import Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular'; 
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HighchartsChartModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  Highcharts: typeof Highcharts = Highcharts;
  updateFlag = false;


  chartOptions: any = {

    lineChart: {
      chart: {
        type: 'line',
        renderTo: 'lineChartContainer'
      },
      title: {
        text: ''
      },
      credits: {
        enabled: false
      },
      colors: ['#003B82', '#00695E', '#DEF5FF', '#8D0034', '#0095DA', '#3ABB9D'],
      xAxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },
      yAxis: {
        title: {
          text: 'Average (Days)'
        }
      },
      series: [
        {
          name: 'All Categories',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
      ]
    },

    donut: {
      chart: {
        type: 'pie',
        renderTo: 'donutChart'
      },
      title: {
        text: ''
      },
      credits: {
        enabled: false
      },
      labels: {
        style: {
          fontSize: '11px'
        }
      },
      plotOptions: {
        series: {
          allowPointSelect: true,
          cursor: 'pointer',
          borderRadius: 8,
          dataLabels: [{
            enabled: true,
            distance: 10,
            format: '{point.name}'
          }, {
            enabled: true,
            distance: -15,
            format: '{point.percentage:.0f}%',
            style: {
              fontSize: '11px'
            }
          }],
          showInLegend: true
        }
      },
      legend: {
        enabled: false
      },
      colors: ['#003B82', '#00695E', '#DEF5FF', '#8D0034', '#0095DA', '#3ABB9D'],
      series: [
        {
          name: 'Percentage',
          colorByPoint: true,
          innerSize: '75%',
          data: [
            { name: 'incoming', y: 2 },
            { name: 'outgoing', y: 2 },
            { name: 'transfer', y: 3 },
            { name: 'completed', y: 4 },
          ]
        }
      ]
    },

    pieChart: {
      chart: {
        type: 'pie',
        renderTo: 'pieChartContainer'
      },
      title: {
        text: ''
      },
      credits: {
        enabled: false
      },
      colors: ['#003B82', '#00695E', '#DEF5FF', '#8D0034', '#0095DA', '#3ABB9D'],
      plotOptions: {
        series: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: [{
            enabled: true,
            distance: 10
          }, {
            enabled: true,
            distance: -40,
            format: '{point.percentage:.1f}%',
            style: {
              fontSize: '11px',
              textOutline: 'none',
              opacity: 0.7
            },
            filter: {
              operator: '>',
              property: 'percentage',
              value: 10
            }
          }]
        }
      },
      legend: {
        enabled: false
      },
      labels: {
        style: {
          fontSize: '11px'
        }
      },
      series: [
        {
          name: 'Percentage',
          colorByPoint: true,
          data: [
            { name: 'incoming', y: 2 },
            { name: 'outgoing', y: 2 },
            { name: 'transfer', y: 3 },
            { name: 'completed', y: 4 },
          ]
        }
      ]
    },

    pieChart2: {
      chart: {
        type: 'pie',
        renderTo: 'pieChartContainer2'
      },
      title: {
        text: ''
      },
      credits: {
        enabled: false
      },
      colors: ['#003B82', '#00695E', '#DEF5FF', '#8D0034', '#0095DA', '#3ABB9D'],
      plotOptions: {
        pie: {
          innerSize: '99%',
          borderWidth: 10,
          borderColor: '',
          slicedOffset: 10,
          dataLabels: {
            connectorWidth: 0,
          },
        }
      },
      legend: {
        enabled: false
      },
      labels: {
        style: {
          fontSize: '11px'
        }
      },
      series: [
        {
          name: '',
          data: [
            { name: 'incoming', y: 2 },
            { name: 'outgoing', y: 2 },
            { name: 'transfer', y: 3 },
            { name: 'completed', y: 4 },
          ]
        }
      ]
    },

    columnChart: {
      chart: {
        type: 'column',
        renderTo: 'columnChartContainer'
      },
      title: {
        text: ''
      },
      credits: {
        enabled: false
      },
      labels: {
        style: {
          fontSize: '11px'
        }
      },
      colors: ['#003B82', '#00695E', '#DEF5FF', '#8D0034', '#0095DA', '#3ABB9D'],
      xAxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
      },
      yAxis: {
        title: {
          fontSize: '11px',
          text: ''
        }
      },
      series: [
        {
          fontSize: '11px',
          name: 'completed',
          data: [3, 5, 1, 4, 8, 7, 6, 9]
        }
      ]
    },

    stackedColumnChart: {
      chart: {
        type: 'column',
        renderTo: 'stackedColumnChart'
      },
      title: {
        text: ''
      },
      credits: {
        enabled: false
      },
      labels: {
        style: {
          fontSize: '11px'
        }
      },
      colors: ['#003B82', '#00695E', '#DEF5FF', '#8D0034', '#0095DA', '#3ABB9D'],
      xAxis: {
        categories: ['completed']
      },
      yAxis: {
        title: {
          fontSize: '11px',
          text: 'Percentage'
        },
        stackLabels: {
          enabled: true,
          style: {
            fontSize: '11px',
            fontWeight: 'bold',
            color: 'gray'
          }
        }
      },
      plotOptions: {
        column: {
          stacking: 'percent',
          dataLabels: {
            enabled: true,
            format: '{point.percentage:.0f}%'
          }
        }
      },
      series: [
        {
          name: 'FollowUp',
          data: [9]
        },
        {
          name: 'Internal',
          data: [8]
        },
        {
          name: 'Incoming',
          data: [15]
        }
      ]
    }


  };

  ngOnInit() {
    this.initializeCharts();
  }

  initializeCharts() {
    Highcharts.chart(this.chartOptions.donut);
    Highcharts.chart(this.chartOptions.lineChart);
    Highcharts.chart(this.chartOptions.pieChart);
    Highcharts.chart(this.chartOptions.pieChart2);
    Highcharts.chart(this.chartOptions.columnChart);
    Highcharts.chart(this.chartOptions.stackedColumnChart);
  }
}