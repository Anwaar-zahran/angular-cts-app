import { Component, Input } from '@angular/core';
import { ToasterService } from '../../../services/toaster.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common'; // Import CommonModule for directives like ngIf, ngFor

@Component({
    selector: 'app-toaster',
    imports: [CommonModule],
    templateUrl: './toaster.component.html',
    styleUrl: './toaster.component.scss'
})
export class ToasterComponent {
  message: string = '';
  show: boolean = false;
  toasterClass: string = '';
  toasterSubscription: Subscription = new Subscription();

  constructor(private toasterService: ToasterService) { }

  ngOnInit(): void {
    // Subscribe to the toaster message observable
    this.toasterSubscription = this.toasterService.toasterMessage$.subscribe(
      (data) => {
        this.message = data.message;
        this.toasterClass = data.className;
        this.show = true;
        
        setTimeout(() => {
          this.show = false;
        }, 3000);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.toasterSubscription) {
      this.toasterSubscription.unsubscribe();
    }
  }

  @Input() set className(value: string) {
    this.toasterClass = value;
  }
}
