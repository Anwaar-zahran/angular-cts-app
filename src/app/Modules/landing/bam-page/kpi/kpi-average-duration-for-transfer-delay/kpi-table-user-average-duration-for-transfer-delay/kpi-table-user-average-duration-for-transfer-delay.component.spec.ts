import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiTableUserAverageDurationForTransferDelayComponent } from './kpi-table-user-average-duration-for-transfer-delay.component';

describe('KpiTableUserAverageDurationForTransferDelayComponent', () => {
  let component: KpiTableUserAverageDurationForTransferDelayComponent;
  let fixture: ComponentFixture<KpiTableUserAverageDurationForTransferDelayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiTableUserAverageDurationForTransferDelayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiTableUserAverageDurationForTransferDelayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
