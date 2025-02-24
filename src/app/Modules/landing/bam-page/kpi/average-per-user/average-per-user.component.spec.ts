import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AveragePerUserComponent } from './average-per-user.component';

describe('AveragePerUserComponent', () => {
  let component: AveragePerUserComponent;
  let fixture: ComponentFixture<AveragePerUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AveragePerUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AveragePerUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
