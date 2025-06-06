import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { ChartsService } from '../../../../../../services/charts.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepicker, MatDatepickerInput } from '@angular/material/datepicker';



@Component({
  selector: 'app-chart-percentage-of-correspondences-completed-and-inprogress',
  templateUrl: './chart-percentage-of-correspondences-completed-and-inprogress.component.html',
  styleUrls: ['./chart-percentage-of-correspondences-completed-and-inprogress.component.css'],
  imports: [CommonModule, HighchartsChartModule, FormsModule, TranslateModule, MatTooltipModule, MatDatepicker, MatDatepickerInput]
})
export class ChartPercentageOfCorrespondencesCompletedAndInprogressComponent implements OnInit, OnChanges, OnDestroy {

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options | undefined;
  info!: string;

  @Input() fromDate: string = '';
  @Input() toDate: string = '';
  @Input() categories: { id: number, text: string }[] = [];
  minToDate: string | null = null;
  isDataAvailable: boolean = false;


  tempFromDate: string = this.fromDate; // Temporary variable for modal input
  tempToDate: string = this.toDate; // Temporary variable for modal input
  isModalOpen: boolean = false;
  private languageSubscription!: Subscription;

  constructor(
    private chartsService: ChartsService,
    private translate: TranslateService
  ) { }

  ngOnInit() {

    this.languageSubscription = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.info = this.translate.instant("BAM.CHARTS.COMPLETION_VS_PROGRESS_INFO")
      this.loadChartData();
    })


    // Only load chart data when categories are available
    if (this.categories && this.categories.length > 0) {
      this.loadChartData();
    }

    // Detect language changes and reload the chart
    this.translate.onLangChange.subscribe(() => {
      this.loadChartData();
    });
  }

  ngOnChanges() {
    // Reload chart data whenever categories input changes and is not empty
    if (this.categories && this.categories.length > 0) {
      this.loadChartData();
    }
  }

  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  private loadChartData() {
    this.info = this.translate.instant("BAM.CHARTS.COMPLETION_VS_PROGRESS_INFO")
    this.chartsService
      .GetDocumentsCompletedAndInProgressByUser({
        fromDate: this.fromDate,
        toDate: this.toDate,
        structureId: localStorage.getItem('structureId') || "1",
        categoryIds: []
      })
      .subscribe((res: { text: string, count: number }[]) => {
        this.translate.get(['', 'Status.InProgress', 'Status.Completed']).subscribe(translations => {

          const chartData = res
            .filter(item => item.count > 0)
            .map(item => {
              const translatedText = this.translate.instant(`BAM.DASHBOARD.CHARTS.STATUS.${item.text.toUpperCase()}`);
              console.log(translatedText)

              return {
                name: translatedText,
                y: item.count
              };
            });

          if (chartData.length > 0) {
            this.isDataAvailable = true;
          }

          this.chartOptions = {
            chart: {
              type: 'pie',
            },
            title: {
              text: translations['BAM.CHARTS.COMPLETION_VS_PROGRESS'],
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
                  format: '<b>{point.name}:</b><b> %{point.percentage:.1f}</b>'
                }
              }
            },
            series: [{
              name: translations['BAM.CHARTS.COMPLETION_VS_PROGRESS'],
              type: 'pie',
              data: chartData
            }]
          };
        });
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
    const dateFrom = new Date(this.tempFromDate);
    const dateTo = new Date(this.tempToDate);

    // Format to yyyy-mm-dd
    this.tempFromDate = dateFrom.getFullYear() + '-'
      + String(dateFrom.getMonth() + 1).padStart(2, '0') + '-'
      + String(dateFrom.getDate()).padStart(2, '0');

    this.tempToDate = dateTo.getFullYear() + '-'
      + String(dateTo.getMonth() + 1).padStart(2, '0') + '-'
      + String(dateTo.getDate()).padStart(2, '0');
    this.fromDate = this.tempFromDate;
    this.toDate = this.tempToDate;
    this.loadChartData(); // Reload chart data with new dates
    this.toggleModal(); // Close the modal after applying the filter
  }

  onFromDateChange() {
    console.log(this.tempFromDate);
    if (this.tempFromDate) {
      let fromDate = new Date(this.tempFromDate);
      //fromDate.setDate(fromDate.getDate());

      this.tempFromDate = fromDate.getFullYear() + '-'
        + String(fromDate.getMonth() + 1).padStart(2, '0') + '-'
        + String(fromDate.getDate()).padStart(2, '0');

      this.minToDate = this.tempFromDate;
    } else {
      this.minToDate = null;
    }
  }

}
