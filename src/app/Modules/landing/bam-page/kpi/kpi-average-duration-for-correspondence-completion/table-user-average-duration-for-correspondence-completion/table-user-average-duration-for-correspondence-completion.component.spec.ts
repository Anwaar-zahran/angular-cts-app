import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableUserAverageDurationForCorrespondenceCompletionComponent } from './table-user-average-duration-for-correspondence-completion.component';

describe('TableUserAverageDurationForCorrespondenceCompletionComponent', () => {
  let component: TableUserAverageDurationForCorrespondenceCompletionComponent;
  let fixture: ComponentFixture<TableUserAverageDurationForCorrespondenceCompletionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableUserAverageDurationForCorrespondenceCompletionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableUserAverageDurationForCorrespondenceCompletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
