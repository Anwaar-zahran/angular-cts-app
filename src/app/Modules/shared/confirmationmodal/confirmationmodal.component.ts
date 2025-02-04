import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-confirmationmodal',
    templateUrl: './confirmationmodal.component.html',
    styleUrl: './confirmationmodal.component.scss',
    standalone: false
})
export class ConfirmationmodalComponent {
  @Input() message: string = ''; // Message to display in the modal
  @Output() confirmed = new EventEmitter<void>(); // Emit event on confirmation

  constructor(public activeModal: NgbActiveModal) { }

  confirm() {
    this.confirmed.emit(); 
    this.activeModal.close();
  }
}
