import { Component, OnInit, Input, OnChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { ChartsService } from '../../../../../../services/charts.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LookupsService } from '../../../../../../services/lookups.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-chart-system-statistics-per-department',
  templateUrl: './chart-system-statistics-per-department.component.html',
  styleUrls: ['./chart-system-statistics-per-department.component.css'],
  imports: [CommonModule, HighchartsChartModule, FormsModule, TranslateModule]
})
export class ChartSystemStatisticsPerDepartmentComponent implements OnInit, OnChanges {

  @Input() categories: { id: number, text: string }[] = [];
  @Input() fromDate: string = '';
  @Input() toDate: string = '';

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options | undefined;

  tempFromDate: string = this.fromDate;
  tempToDate: string = this.toDate;
  isModalOpen: boolean = false;
  entities: { id: number, name: string }[] = [];

  constructor(
    private chartsService: ChartsService,
    private lookupsService: LookupsService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.lookupsService.getEntities().subscribe((res: any) => {
      this.entities = res;
      console.log('entities', this.entities);
      if (this.categories && this.categories.length > 0) {
        this.loadChartData();
      }
    });
  }

  ngOnChanges() {
    if (this.categories && this.categories.length > 0) {
      this.loadChartData();
    }
  }

  private loadChartData() {
    this.chartsService
      .GetStatisticsPerDepartment({
        fromDate: this.fromDate,
        toDate: this.toDate,
        structureIds: undefined,
      })
      .subscribe((res: any) => {
        // Transform raw data into structured format
        const transformedData = res.map((item: any) => ({
          categoryName: this.categories.find(c => c.id === item.categoryId)?.text || 'Unknown Category',
          structureName: this.entities.find(e => e.id === item.structureId)?.name || `Structure ${item.structureId}`,
          count: item.count
        }));

        // Get unique structure names
        const uniqueStructures = Array.from(new Set(transformedData.map((item: any) => item.structureName)));

        // Group data by category
        const groupedByCategory = transformedData.reduce((acc: any, curr: any) => {
          if (!acc[curr.categoryName]) {
            acc[curr.categoryName] = {
              name: curr.categoryName,
              data: new Array(uniqueStructures.length).fill(0)
            };
          }
          const structureIndex = uniqueStructures.indexOf(curr.structureName);
          acc[curr.categoryName].data[structureIndex] = curr.count;
          return acc;
        }, {});

        // Convert grouped data to series format
        const seriesData = Object.values(groupedByCategory)
          .filter((series: any) => series.data.some((count: number) => count > 0))
          .map((series: any) => ({
            ...series,
            type: 'bar'
          }));

        const translateService = this.translateService;

        this.chartOptions = {
          chart: {
            type: 'bar'
          },
         
          title: {
            text: this.translateService.instant('BAM.CHARTS.TITLES.STATISTICS_PER_STRUCTURE')
          },
          colors: ['#003B82', '#00695E', '#DEF5FF', '#8D0034', '#0095DA', '#3ABB9D'],
          xAxis: {
            categories: uniqueStructures as string[],
            title: {
              text: this.translateService.instant('BAM.CHARTS.LABELS.STRUCTURES')
            }
          },
          yAxis: {
            min: 0,
            title: {
              text: this.translateService.instant('BAM.CHARTS.LABELS.COUNT'),
              align: 'high'
            },
            labels: {
              overflow: 'justify'
            }
          },
          tooltip: {
            valueSuffix: ' ' + this.translateService.instant('BAM.CHARTS.LABELS.COUNTS'),
            shared: true,
            useHTML: true,
            formatter: function () {
              if (this.y === 0) return false;
              return `${this.series.name}: ${this.y}<br/>${translateService.instant('BAM.CHARTS.LABELS.TOTAL')}: ${this.total}`;
            }
          },
          plotOptions: {
            bar: {
              dataLabels: {
                enabled: true,
                formatter: function () {
                  return this.y === 0 ? '' : this.y;
                }
              },
              stacking: 'normal'
            }
          },
          legend: {
            enabled: true,
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom',
            floating: false,
            borderWidth: 1,
            backgroundColor: '#FFFFFF',
            shadow: true,
            itemStyle: {
              color: '#333333',
              fontWeight: 'bold',
              fontSize: '12px'
            }
          },
          credits: {
            enabled: false
          },
          series: seriesData as Highcharts.SeriesOptionsType[]
        };
      });
  }

  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
    if (this.isModalOpen) {
      this.tempFromDate = this.fromDate;
      this.tempToDate = this.toDate;
    }
  }

  applyFilter() {
    this.fromDate = this.tempFromDate;
    this.toDate = this.tempToDate;
    this.loadChartData();
    this.toggleModal();
  }
}
