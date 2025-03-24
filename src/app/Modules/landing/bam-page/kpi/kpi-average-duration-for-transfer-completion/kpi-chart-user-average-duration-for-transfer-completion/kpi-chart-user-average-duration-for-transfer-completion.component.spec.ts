import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiChartUserAverageDurationForTransferCompletionComponent } from './kpi-chart-user-average-duration-for-transfer-completion.component';

describe('KpiChartUserAverageDurationForTransferCompletionComponent', () => {
  let component: KpiChartUserAverageDurationForTransferCompletionComponent;
  let fixture: ComponentFixture<KpiChartUserAverageDurationForTransferCompletionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiChartUserAverageDurationForTransferCompletionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiChartUserAverageDurationForTransferCompletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
