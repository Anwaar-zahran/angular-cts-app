import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferModalComponent } from './transfer-modal.component';

describe('TransferModalComponent', () => {
  let component: TransferModalComponent;
  let fixture: ComponentFixture<TransferModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
