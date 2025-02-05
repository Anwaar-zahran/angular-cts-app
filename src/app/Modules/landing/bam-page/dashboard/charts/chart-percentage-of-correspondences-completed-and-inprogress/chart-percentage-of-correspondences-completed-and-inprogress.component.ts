import { Component, Input, OnChanges, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { ChartsService } from '../../../../../../services/charts.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'app-chart-percentage-of-correspondences-completed-and-inprogress',
    templateUrl: './chart-percentage-of-correspondences-completed-and-inprogress.component.html',
    styleUrls: ['./chart-percentage-of-correspondences-completed-and-inprogress.component.css'],
    imports: [CommonModule, HighchartsChartModule, FormsModule]
})
export class ChartPercentageOfCorrespondencesCompletedAndInprogressComponent implements OnInit, OnChanges {

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options | undefined;

  @Input() fromDate: string = '';
  @Input() toDate: string = '';
  @Input() categories: { id: number, text: string }[] = [];

  tempFromDate: string = this.fromDate; // Temporary variable for modal input
  tempToDate: string = this.toDate; // Temporary variable for modal input
  isModalOpen: boolean = false;

  constructor(private chartsService: ChartsService) { }

  ngOnInit() {
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
      .GetDocumentsCompletedAndInProgressByUser({
        fromDate: this.fromDate,
        toDate: this.toDate,
        structureId: '1',
        categoryIds: []
      })
      .subscribe((res: { text: string, count: number }[]) => {


        this.chartOptions = {
          chart: {
            type: 'pie',
          },
          title: {
            text: '',
          },
          colors: ['#003B82', '#00695E', '#DEF5FF', '#8D0034', '#0095DA', '#3ABB9D'],
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
          plotOptions: {
            pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.percentage:.1f} %'
              }
            }
          },
          series: [{
            name: 'Transfers',
            type: 'pie',
            data: res.map(item => [item.text, item.count])
          }]
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
