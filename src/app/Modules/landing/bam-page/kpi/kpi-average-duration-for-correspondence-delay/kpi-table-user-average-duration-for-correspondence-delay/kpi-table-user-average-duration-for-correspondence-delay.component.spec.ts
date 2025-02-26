import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiTableUserAverageDurationForCorrespondenceDelayComponent } from './kpi-table-user-average-duration-for-correspondence-delay.component';

describe('KpiTableUserAverageDurationForCorrespondenceDelayComponent', () => {
  let component: KpiTableUserAverageDurationForCorrespondenceDelayComponent;
  let fixture: ComponentFixture<KpiTableUserAverageDurationForCorrespondenceDelayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiTableUserAverageDurationForCorrespondenceDelayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiTableUserAverageDurationForCorrespondenceDelayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
