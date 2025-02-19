import { Component, Input, Output, EventEmitter, input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';  // Import TranslateService

@Component({
  selector: 'app-confirmationmodal',
  templateUrl: './confirmationmodal.component.html',
  styleUrls: ['./confirmationmodal.component.scss'],
  standalone: false
})
export class ConfirmationmodalComponent {
  @Input() message: string = ''; // Message to display in the modal
  @Input() cancelLabel: string = ''; // Translated cancel button label
  @Input() confirmLabel: string = ''; // Translated confirm button label
  @Input() ConfirmTitle:string='';  //translate confirm modal title
  @Output() confirmed = new EventEmitter<void>(); // Emit event on confirmation

  constructor(
    public activeModal: NgbActiveModal,
    private translate: TranslateService // Inject TranslateService
  ) { }

  ngOnInit() {
    // If no labels are provided, load defaults
    if (!this.cancelLabel) {
      this.translate.get('BUTTONS.CANCEL').subscribe((res: string) => {
        this.cancelLabel = res;
      });
    }
    if (!this.confirmLabel) {
      this.translate.get('BUTTONS.CONFIRM').subscribe((res: string) => {
        this.confirmLabel = res;
      });
    }
  }

  confirm() {
    this.confirmed.emit(); 
    this.activeModal.close();
  }
}
