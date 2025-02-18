import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss']
})
export class BackButtonComponent {
  constructor(private location: Location, private router: Router) {}

  goBack(): void {
    if (this.shouldGoToHomePage()) {
      this.router.navigate(['/landing']);
    } else {
      this.location.back();
    }
  }

  private shouldGoToHomePage(): boolean {
    const currentRoute = this.router.url;
    return !currentRoute.includes('/reports/') && !currentRoute.includes('/bam/');
  }
}

