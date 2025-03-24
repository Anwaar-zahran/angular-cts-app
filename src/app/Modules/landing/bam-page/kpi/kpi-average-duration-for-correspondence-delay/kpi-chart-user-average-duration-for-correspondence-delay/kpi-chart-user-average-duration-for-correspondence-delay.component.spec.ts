import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiChartUserAverageDurationForCorrespondenceDelayComponent } from './kpi-chart-user-average-duration-for-correspondence-delay.component';

describe('KpiChartUserAverageDurationForCorrespondenceDelayComponent', () => {
  let component: KpiChartUserAverageDurationForCorrespondenceDelayComponent;
  let fixture: ComponentFixture<KpiChartUserAverageDurationForCorrespondenceDelayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiChartUserAverageDurationForCorrespondenceDelayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiChartUserAverageDurationForCorrespondenceDelayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
