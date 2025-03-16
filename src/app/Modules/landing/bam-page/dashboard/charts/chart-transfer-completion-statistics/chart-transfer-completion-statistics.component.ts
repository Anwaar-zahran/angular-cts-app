import { Component, Input, OnChanges, OnInit } from '@angular/core';
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
  selector: 'app-chart-transfer-completion-statistics',
  templateUrl: './chart-transfer-completion-statistics.component.html',
  styleUrls: ['./chart-transfer-completion-statistics.component.css'],
  imports: [CommonModule, HighchartsChartModule, FormsModule, TranslateModule, MatTooltipModule, MatDatepicker, MatDatepickerInput]
})
export class ChartTransferCompletionStatisticsComponent implements OnInit, OnChanges {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options | undefined;
  info!:string
  // @Input() fromDate: Date | undefined;
  // @Input() toDate: Date | undefined;

  @Input() fromDate: string = '';
  @Input() toDate: string = '';
  minToDate: string | null = null;

  tempFromDate: string = this.fromDate; // Temporary variable for modal input
  tempToDate: string = this.toDate; // Temporary variable for modal input
  isModalOpen: boolean = false;
  isDataAvailable: boolean = false;

  // tempFromDate: Date | undefined;
  // tempToDate: Date | undefined;
  // isModalOpen: boolean = false;

  languageSubscription!: Subscription;

  constructor(private chartsService: ChartsService, private translate: TranslateService) { }

  ngOnInit() {

    this.languageSubscription = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.info = this.translate.instant("BAM.CHARTS.TRANSFER_COMPLETION_INFO")
      this.loadChartData();
    });

    this.loadChartData();
  }

  ngOnChanges() {
    this.loadChartData();
  }

  private loadChartData() {
    this.info = this.translate.instant("BAM.CHARTS.TRANSFER_COMPLETION_INFO")
    this.chartsService
      .getTransferCompletionStatistics({
        fromDate: this.fromDate? this.formatDate(this.fromDate) : '',
        toDate: this.toDate? this.formatDate(this.toDate): '',
        structureId:  localStorage.getItem('structureId') || "1",
      })
      .subscribe((res: any) => {
        const averageCreatedByUser = (parseFloat(res?.averageCreatedByUser) || 0) / 10000;
        const averageTransfers = (parseFloat(res?.averageTransfers) || 0) / 10000;
  
        if(averageCreatedByUser > 0 || averageTransfers > 0){
          this.isDataAvailable = true
        }
        const isRTL = document.dir === 'rtl';
  
        this.chartOptions = {
          chart: {
            type: 'column',
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
          xAxis: {
            categories: [
              this.translate.instant('BAM.CHARTS.TRANSFER_COMPLETION_STATISTICS.AVERAGE_CREATED_BY_USER'),
              this.translate.instant('BAM.CHARTS.TRANSFER_COMPLETION_STATISTICS.AVERAGE_TRANSFERS')
            ],
            crosshair: true,
            reversed: isRTL,
          },
          yAxis: {
            min: 0,
            reversed: false,
            opposite: isRTL,
            title: {
              text: this.translate.instant("BAM.DASHBOARD.CHARTS.LABELS.VALUE"),
            },
            labels: {
              formatter: function() {
                return Number(this.value).toFixed(1);
              },
            },
          },
          tooltip: {
            pointFormat: '{series.name}: <b>{point.y:.1f}</b>',
            style: {
              textAlign: isRTL ? 'right' : 'left'
            }
          },
          plotOptions: {
            series: {
              stacking: undefined
            }
          },
          series: [
            {
              name: this.translate.instant('BAM.CHARTS.TRANSFER_COMPLETION_STATISTICS.AVERAGE_CREATED_BY_USER'),
              type: 'column',
              data: [averageCreatedByUser , averageTransfers],
            },
          ],
          legend: {
            rtl: isRTL
          },
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

  formatDate(date: Date | undefined | string): string {
    if (!date) return '';

    let parsedDate: Date;

    if (typeof date === 'string') {
        parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            return ''; // Return empty string if the date is invalid
        }
    } else {
        parsedDate = date;
    }

    const day = parsedDate.getDate().toString().padStart(2, '0');
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = parsedDate.getFullYear().toString();

    return `${day}/${month}/${year}`;
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
