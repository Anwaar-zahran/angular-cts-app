import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartStructureAverageDurationForCorrespondenceCompletionComponent } from './chart-structure-average-duration-for-correspondence-completion.component';

describe('ChartStructureAverageDurationForCorrespondenceCompletionComponent', () => {
  let component: ChartStructureAverageDurationForCorrespondenceCompletionComponent;
  let fixture: ComponentFixture<ChartStructureAverageDurationForCorrespondenceCompletionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartStructureAverageDurationForCorrespondenceCompletionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartStructureAverageDurationForCorrespondenceCompletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
