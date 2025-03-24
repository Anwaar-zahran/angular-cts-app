import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiChartUserAverageDurationForCorrespondenceCompletionComponent } from './kpi-chart-user-average-duration-for-correspondence-completion.component';

describe('KpiChartUserAverageDurationForCorrespondenceCompletionComponent', () => {
  let component: KpiChartUserAverageDurationForCorrespondenceCompletionComponent;
  let fixture: ComponentFixture<KpiChartUserAverageDurationForCorrespondenceCompletionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiChartUserAverageDurationForCorrespondenceCompletionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiChartUserAverageDurationForCorrespondenceCompletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
