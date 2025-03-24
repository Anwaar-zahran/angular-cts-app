import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiChartUserAverageDurationForTransferDelayComponent } from './kpi-chart-user-average-duration-for-transfer-delay.component';

describe('KpiChartUserAverageDurationForTransferDelayComponent', () => {
  let component: KpiChartUserAverageDurationForTransferDelayComponent;
  let fixture: ComponentFixture<KpiChartUserAverageDurationForTransferDelayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiChartUserAverageDurationForTransferDelayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiChartUserAverageDurationForTransferDelayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
