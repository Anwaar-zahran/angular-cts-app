import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiChartStructureAverageDurationForTransferCompletionComponent } from './kpi-chart-structure-average-duration-for-transfer-completion.component';

describe('KpiChartStructureAverageDurationForTransferCompletionComponent', () => {
  let component: KpiChartStructureAverageDurationForTransferCompletionComponent;
  let fixture: ComponentFixture<KpiChartStructureAverageDurationForTransferCompletionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiChartStructureAverageDurationForTransferCompletionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiChartStructureAverageDurationForTransferCompletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
