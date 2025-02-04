import { Component } from '@angular/core';
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
  toasterSubscription: Subscription = new Subscription();

  constructor(private toasterService: ToasterService) { }

  ngOnInit(): void {
    // Subscribe to the toaster message observable
    this.toasterSubscription = this.toasterService.toasterMessage$.subscribe(
      (message) => {
        this.message = message;
        this.show = true;
        setTimeout(() => {
          this.show = false; // Hide the toaster after 3 seconds
        }, 3000);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.toasterSubscription) {
      this.toasterSubscription.unsubscribe();
    }
  }
}
