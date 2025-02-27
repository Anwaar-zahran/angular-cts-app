import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiChartStructureAverageDurationForTransferDelayComponent } from './kpi-chart-structure-average-duration-for-transfer-delay.component';

describe('KpiChartStructureAverageDurationForTransferDelayComponent', () => {
  let component: KpiChartStructureAverageDurationForTransferDelayComponent;
  let fixture: ComponentFixture<KpiChartStructureAverageDurationForTransferDelayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiChartStructureAverageDurationForTransferDelayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiChartStructureAverageDurationForTransferDelayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
