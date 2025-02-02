import { Component, OnInit, Input } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { ChartsService } from '../../../../../../services/charts.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LookupsService } from '../../../../../../services/lookups.service';

@Component({
    selector: 'app-chart-system-count-per-category-and-status',
    templateUrl: './chart-system-count-per-category-and-status.component.html',
    styleUrls: ['./chart-system-count-per-category-and-status.component.css'],
    imports: [CommonModule, HighchartsChartModule, FormsModule]
})
export class ChartSystemCountPerCategoryAndStatusComponent implements OnInit {

  @Input() categories: { id: number, text: string }[] = [];
  @Input() fromDate: string = '';
  @Input() toDate: string = '';

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options | undefined;

  tempFromDate: string = this.fromDate; // Temporary variable for modal input
  tempToDate: string = this.toDate; // Temporary variable for modal input
  isModalOpen: boolean = false;
  statuses: { id: number, text: string }[] = [];

  constructor(private chartsService: ChartsService, private lookupsService: LookupsService) { }

  ngOnInit() {
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
    this.chartsService
      .GetCountPerCategoryAndStatus({
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
            pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}',
            formatter: function () {
              if (this.y === 0) return false; // Hide tooltip for zero values
              return `${this.series.name}: ${this.y}<br/>Total: ${this.total}`;
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
