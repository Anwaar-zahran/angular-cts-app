import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplyToComponent } from './reply-to.component';

describe('ReplyToComponent', () => {
  let component: ReplyToComponent;
  let fixture: ComponentFixture<ReplyToComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplyToComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReplyToComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
