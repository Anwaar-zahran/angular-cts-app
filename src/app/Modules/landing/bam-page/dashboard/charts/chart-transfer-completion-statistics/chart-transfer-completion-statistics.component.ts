import { Component, Input, OnChanges, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { ChartsService } from '../../../../../../services/charts.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'app-chart-transfer-completion-statistics',
    templateUrl: './chart-transfer-completion-statistics.component.html',
    styleUrls: ['./chart-transfer-completion-statistics.component.css'],
    imports: [CommonModule, HighchartsChartModule, FormsModule]
})
export class ChartTransferCompletionStatisticsComponent implements OnInit, OnChanges {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options | undefined;

  @Input() fromDate: string = '';
  @Input() toDate: string = '';

  tempFromDate: string = this.fromDate; // Temporary variable for modal input
  tempToDate: string = this.toDate; // Temporary variable for modal input
  isModalOpen: boolean = false;

  constructor(private chartsService: ChartsService) { }

  ngOnInit() {
    this.loadChartData();
  }

  ngOnChanges() {
    this.loadChartData();
  }

  private loadChartData() {
    this.chartsService
      .getTransferCompletionStatistics({
        fromDate: this.fromDate,
        toDate: this.toDate,
        structureId: '1',
      })
      .subscribe((res: any) => {
        const averageCreatedByUser = parseFloat(res?.averageCreatedByUser) || 0;
        const averageTransfers = parseFloat(res?.averageTransfers) || 0;

        this.chartOptions = {
          chart: {
            type: 'column',
          },
          title: {
            text: '',
          },
          exporting: {
            enabled: true,
            buttons: {
              contextButton: {
                menuItems: [
                  'viewFullscreen',
                  'downloadPNG',
                  'downloadJPEG',
                  'downloadPDF',
                  'downloadSVG'
                ]
              },
            },
          },
          xAxis: {
            categories: ['Average Created By User', 'Average Transfers'],
            crosshair: true,
          },
          yAxis: {
            min: 0,
            title: {
              text: 'Value',
            },
          },
          series: [
            {
              name: 'Transfers',
              type: 'column',
              data: [averageCreatedByUser || 0, averageTransfers || 0],
            },
          ],
        };
      });
  }

  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
    // Reset temporary variables when opening the modal
    if (this.isModalOpen) {
      this.tempFromDate = this.fromDate;
      this.tempToDate = this.toDate;
    }
  }

  applyFilter() {
    // Update the actual date variables only when the form is submitted
    this.fromDate = this.tempFromDate;
    this.toDate = this.tempToDate;
    this.loadChartData(); // Reload chart data with new dates
    this.toggleModal(); // Close the modal after applying the filter
  }


}
