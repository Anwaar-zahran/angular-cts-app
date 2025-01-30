import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailDetailsDialogComponent } from './mail-details-dialog.component';

describe('MailDetailsDialogComponent', () => {
  let component: MailDetailsDialogComponent;
  let fixture: ComponentFixture<MailDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MailDetailsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MailDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
