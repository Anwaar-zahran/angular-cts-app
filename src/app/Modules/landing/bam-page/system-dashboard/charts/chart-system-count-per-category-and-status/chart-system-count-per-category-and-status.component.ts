import { Component, OnInit, Input } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { ChartsService } from '../../../../../../services/charts.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LookupsService } from '../../../../../../services/lookups.service';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule, MatDatepicker, MatDatepickerInput } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';


@Component({
  selector: 'app-chart-system-count-per-category-and-status',
  templateUrl: './chart-system-count-per-category-and-status.component.html',
  styleUrls: ['./chart-system-count-per-category-and-status.component.css'],
  imports: [CommonModule, HighchartsChartModule, FormsModule, TranslateModule, MatTooltipModule, MatDatepicker, MatDatepickerInput]
})
export class ChartSystemCountPerCategoryAndStatusComponent implements OnInit {

  @Input() categories: { id: number, text: string }[] = [];
  @Input() fromDate: string = '';
  @Input() toDate: string = '';
  minToDate: string | null = null;
  info!: string;

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options | undefined;
  isDataAvailable: boolean = false;

  tempFromDate: string = this.fromDate; // Temporary variable for modal input
  tempToDate: string = this.toDate; // Temporary variable for modal input
  isModalOpen: boolean = false;
  statuses: { id: number, text: string }[] = [];
  private languageSubscription!: Subscription;

  constructor(
    private chartsService: ChartsService,
    private lookupsService: LookupsService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {

    this.languageSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.info = this.translateService.instant("BAM.CHARTS.INFO.COUNT_PER_STATUS")
      this.loadChartData();
    });
    // Only load chart data when categories are available
    this.lookupsService.getStatus().subscribe((res: any) => {
      this.statuses = res;
      if (this.categories && this.categories.length > 0) {
        this.info = this.translateService.instant("BAM.CHARTS.INFO.COUNT_PER_STATUS")
        this.loadChartData();
      }
    });

  }

  ngOnChanges() {
    // Reload chart data whenever categories input changes and is not empty

    this.loadChartData();

  }

  private loadChartData() {
    this.info = this.translateService.instant("BAM.CHARTS.INFO.COUNT_PER_STATUS")
    this.chartsService
      .GetCountPerCategoryAndStatus({
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
        const seriesData = this.categories
          .map(category => {
            const data = statusIds.map(statusId => {
              const item = res.find((r: any) => r.categoryId === category.id && r.statusId === statusId);
              return item ? item.count : 0;
            });

            // Only include categories that have at least one non-zero value
            if (data.some(count => count > 0)) {
              return {
                name: this.translateService.instant(`BAM.DASHBOARD.CHARTS.STATUS.${category.text?.toUpperCase().replace(/\s+/g, '_')}`),
                type: 'column',
                data: data
              };
            }
            return null;
          })
          .filter((series): series is NonNullable<typeof series> => series !== null);

        if (seriesData.length > 0) {
          this.isDataAvailable = true;
        }

        this.renderChart(seriesData);
      });
  }

  private renderChart(seriesData: any[]) {

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
          this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.INTERNAL"),
          this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.INCOMING"),
          this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.COMPLETED"),
          this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.IN_PROGRESS"),
          this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.OVERDUE"),
          this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.OUTGOING"),
          this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.FOLLOW_UP"),
        ],
        title: {
          text: this.translateService.instant("BAM.DASHBOARD.CHARTS.LABELS.CATEGORY")
        },
        crosshair: true,
      },
      yAxis: {
        min: 0,
        title: {
          text: this.translateService.instant('BAM.CHARTS.LABELS.COUNT')
        },
        stackLabels: {
          enabled: true,
          style: {
            fontWeight: 'bold',
            color: (Highcharts!.defaultOptions!.title!.style && Highcharts!.defaultOptions!.title!.style!.color) || 'gray'
          }
        }
      },
      tooltip: {
        headerFormat: this.translateService.instant("BAM.DASHBOARD.CHARTS.STATUS.INCOMING") + '<b>{point.x}</b><br/>',
        pointFormat: '{series.name}: {point.y} <br/>' +
          this.translateService.instant('BAM.CHARTS.LABELS.TOTAL') + ': {point.stackTotal}',
        formatter: function () {
          if (this.y === 0) return false;
          return `${this.series.name}: ${this.y}<br/>${this.series.chart.tooltip.options.pointFormat}`;
        }
      },
      plotOptions: {
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
      series: seriesData as Highcharts.SeriesOptionsType[]
    };
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
    this.chartOptions = undefined;

    // Update the actual date variables only when the form is submitted
    this.fromDate = this.tempFromDate;
    this.toDate = this.tempToDate;
    this.loadChartData(); // Reload chart data with new dates
    this.toggleModal(); // Close the modal after applying the filter
  }

  onFromDateChange() {
    console.log(this.tempFromDate);
    if (this.tempFromDate) {
      let fromDate = new Date(this.tempFromDate);
      fromDate.setDate(fromDate.getDate());

      this.minToDate = fromDate.toISOString().split('T')[0];
    } else {
      this.minToDate = null;
    }
  }


}
