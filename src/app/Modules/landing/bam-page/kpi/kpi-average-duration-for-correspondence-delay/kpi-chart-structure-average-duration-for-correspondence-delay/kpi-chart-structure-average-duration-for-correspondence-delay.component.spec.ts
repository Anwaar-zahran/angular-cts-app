import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiChartStructureAverageDurationForCorrespondenceDelayComponent } from './kpi-chart-structure-average-duration-for-correspondence-delay.component';

describe('KpiChartStructureAverageDurationForCorrespondenceDelayComponent', () => {
  let component: KpiChartStructureAverageDurationForCorrespondenceDelayComponent;
  let fixture: ComponentFixture<KpiChartStructureAverageDurationForCorrespondenceDelayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiChartStructureAverageDurationForCorrespondenceDelayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiChartStructureAverageDurationForCorrespondenceDelayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
