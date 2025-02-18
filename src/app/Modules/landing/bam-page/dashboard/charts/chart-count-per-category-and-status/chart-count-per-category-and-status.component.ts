import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { ChartsService } from '../../../../../../services/charts.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LookupsService } from '../../../../../../services/lookups.service';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chart-count-per-category-and-status',
  templateUrl: './chart-count-per-category-and-status.component.html',
  styleUrls: ['./chart-count-per-category-and-status.component.css'],
  imports: [CommonModule, HighchartsChartModule, FormsModule, TranslateModule]
})
export class ChartCountPerCategoryAndStatusComponent implements OnInit, OnDestroy {
  @Input() categories: { id: number, text: string }[] = [];
  @Input() fromDate: string = '';
  @Input() toDate: string = '';

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options | undefined;

  tempFromDate: string = this.fromDate; // Temporary variable for modal input
  tempToDate: string = this.toDate; // Temporary variable for modal input
  isModalOpen: boolean = false;
  statuses: { id: number, text: string }[] = [];
  private languageSubscription!: Subscription

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

    this.languageSubscription = this.translate.onLangChange.subscribe((event:LangChangeEvent)=>{
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
    // Store translated text before setting chart options
    const totalLabel = this.translate.instant('BAM.CHARTS.LABELS.TOTAL');

    this.chartsService
      .GetCountPerCategoryAndStatusByUser({
        fromDate: this.fromDate,
        toDate: this.toDate,
        structureId: '1',
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
                name: category.text,
                type: 'column',
                data: data
              };
            }
            return null;
          })
          .filter((series): series is NonNullable<typeof series> => series !== null);

        this.chartOptions = {
          chart: {
            type: 'column',
          },
          title: {
            text: '',
          },
          colors: ['#003B82', '#00695E', '#DEF5FF', '#8D0034', '#0095DA', '#3ABB9D'],
          xAxis: {
            categories: statusNames,
            crosshair: true,
          },
          yAxis: {
            min: 0,
            title: {
              text: 'Count',
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
            headerFormat: '<b>{point.x}</b><br/>',
            pointFormat: `{series.name}: {point.y}<br/>${totalLabel}: {point.stackTotal}`,
            formatter: function () {
              if (this.y === 0) return false; // Hide tooltip for zero values
              return `${this.series.name}: ${this.y}<br/>${totalLabel}: ${this.total}`;
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
