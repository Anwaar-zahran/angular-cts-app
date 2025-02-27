import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiTableUserAverageDurationForTransferCompletionComponent } from './kpi-table-user-average-duration-for-transfer-completion.component';

describe('KpiTableUserAverageDurationForTransferCompletionComponent', () => {
  let component: KpiTableUserAverageDurationForTransferCompletionComponent;
  let fixture: ComponentFixture<KpiTableUserAverageDurationForTransferCompletionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiTableUserAverageDurationForTransferCompletionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiTableUserAverageDurationForTransferCompletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
