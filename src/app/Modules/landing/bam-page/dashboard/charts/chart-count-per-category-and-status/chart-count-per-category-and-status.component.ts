import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { ChartsService } from '../../../../../../services/charts.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LookupsService } from '../../../../../../services/lookups.service';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepicker, MatDatepickerInput } from '@angular/material/datepicker';


@Component({
  selector: 'app-chart-count-per-category-and-status',
  templateUrl: './chart-count-per-category-and-status.component.html',
  styleUrls: ['./chart-count-per-category-and-status.component.css'],
  imports: [CommonModule, HighchartsChartModule, FormsModule, TranslateModule, MatTooltipModule, MatDatepicker, MatDatepickerInput]
})
export class ChartCountPerCategoryAndStatusComponent implements OnInit, OnDestroy {
  @Input() categories: { id: number, text: string }[] = [];
  @Input() fromDate: string = '';
  @Input() toDate: string = '';
  minToDate: string | null = null;
  info!: string;

  isDataAvailable: boolean = false;
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options | undefined;

  tempFromDate: string = this.fromDate; // Temporary variable for modal input
  tempToDate: string = this.toDate; // Temporary variable for modal input
  isModalOpen: boolean = false;
  statuses: { id: number, text: string }[] = [];
  private languageSubscription!: Subscription
  totalCount!: number;

  constructor(
    private chartsService: ChartsService,
    private lookupsService: LookupsService,
    private translate: TranslateService
  ) { }


  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }


  ngOnInit() {

    this.languageSubscription = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.info = this.translate.instant("BAM.CHARTS.INFO.COUNT_PER_STATUS")
      this.loadChartData();
    });
    // Only load chart data when categories are available
    this.lookupsService.getStatus().subscribe((res: any) => {
      this.statuses = res;

      if (this.categories && this.categories.length > 0) {
        this.loadChartData();
      }
    });

  }

  ngOnChanges() {
    // Reload chart data whenever categories input changes and is not empty
    if (this.categories && this.categories.length > 0) {
      this.loadChartData();
    }
  }

  private loadChartData() {
    this.info = this.translate.instant("BAM.CHARTS.INFO.COUNT_PER_STATUS")
    // Store translated text before setting chart options
    const totalLabel = this.translate.instant('BAM.CHARTS.LABELS.TOTAL');

    this.chartsService
      .GetCountPerCategoryAndStatusByUser({
        fromDate: this.fromDate,
        toDate: this.toDate,
        structureId: localStorage.getItem('structureId') || "1",
      })
      .subscribe((res: any) => {
        // Get unique status IDs for X axis
        const statusIds = Array.from(new Set(res.map((item: any) => item.statusId)));
        const statusNames = statusIds.map(id => {
          const status = this.statuses.find(s => s.id === id);
          return status ? status.text : `Status ${id}`;
        });

        // Create series data for each category and filter out categories with all zeros
        const totalFirstElements = this.categories.reduce((sum, category) => {
          const data = statusIds.map(statusId => {
            const item = res.find((r: any) => r.categoryId === category.id && r.statusId === statusId);
            return item ? item.count : 0;
          });
          return sum + (data.length > 0 ? data[0] : 0);
        }, 0);

        console.log('total count 1')
        console.log(totalFirstElements);

        const seriesData = this.categories
        .map(category => {
          const data = statusIds.map(statusId => {
            const item = res.find((r: any) => r.categoryId === category.id && r.statusId === statusId);
            return item ? item.count : 0;
          });
      
          if (data.some(count => count > 0)) {
            return {
              name: this.translate.instant(`BAM.DASHBOARD.CHARTS.STATUS.${category.text.toUpperCase().replace(/\s+/g, '_')}`),
              type: 'column',
              data: data // Use actual data instead of percentage
            };
          }
          return null;
        })
        .filter((series): series is NonNullable<typeof series> => series !== null);
      
        console.log('serrrrrrrrrrrrrr')
        console.log(seriesData); // Debugging: Check the data
        if (seriesData.length > 0) {
          this.isDataAvailable = true;
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
          xAxis: {
            categories: [
              this.translate.instant("BAM.DASHBOARD.CHARTS.STATUS.INTERNAL"),
              this.translate.instant("BAM.DASHBOARD.CHARTS.STATUS.INCOMING"),
              this.translate.instant("BAM.DASHBOARD.CHARTS.STATUS.COMPLETED"),
              this.translate.instant("BAM.DASHBOARD.CHARTS.STATUS.IN_PROGRESS"),
              this.translate.instant("BAM.DASHBOARD.CHARTS.STATUS.OVERDUE"),
              this.translate.instant("BAM.DASHBOARD.CHARTS.STATUS.OUTGOING"),
              this.translate.instant("BAM.DASHBOARD.CHARTS.STATUS.FOLLOW_UP"),
            ],
            title: {
              text: this.translate.instant('BAM.DASHBOARD.CHARTS.LABELS.CATEGORY')
            },
            crosshair: true,
            reversed: isRTL
          },
          yAxis: {
            min: 0,
            reversed: false,
            opposite: isRTL,
            title: {
              text: this.translate.instant("BAM.DASHBOARD.CHARTS.LABELS.COUNT"),
            },
            stackLabels: {
              enabled: true,
              formatter: function () {
                return totalFirstElements.toString(); // Display totalFirstElements instead of default sum
              },
              style: {
                fontWeight: 'bold',
                color: (Highcharts!.defaultOptions!.title!.style && Highcharts!.defaultOptions!.title!.style!.color) || 'gray'
              },
            }
          },
          tooltip: {
            headerFormat: '<b>{point.x}</b><br/>',
            pointFormat: `{series.name}: {point.y}<br/>${totalLabel}: {point.stackTotal}`,
            formatter: function () {
              if (this.y === 0) return false; // Hide tooltip for zero values
              return `${this.series.name}: ${this.y}<br/>${totalLabel}: ${totalFirstElements}`;
            },
            style: {
              textAlign: isRTL ? 'right' : 'left'
            }
          },
          plotOptions: {
            series: {
              stacking: undefined
            },
            column: {
              stacking: 'normal',
              dataLabels: {
                enabled: true,
                formatter: function () {
                  return this.y === 0 ? '' : this.y; // Hide zero labels
                }
              }
            }
          },
          series: seriesData as Highcharts.SeriesOptionsType[],
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

  opacity: string = '0';
  visibility: string = 'hidden';

  showInfo() {
    this.opacity = '1';
    this.visibility = 'visible';
  }

  hideInfo() {
    this.opacity = '0';
    this.visibility = 'hidden';
  }
}
