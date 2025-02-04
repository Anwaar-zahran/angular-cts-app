import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    standalone: false
})
export class HeaderComponent implements OnInit {

  userInfo = { name: "Fatima AliAhmad", Job: "Frontend Developer", ID: 1234, image: null }

  showMenu: boolean = true;

  MainnavItems = [
    { link: 'MyMail', icon: 'assets/images/icons/email.svg', title: 'My Mail' },
    { link: 'mail', icon: 'assets/images/icons/signature-with-a-pen.svg', title: 'Mail for Signature' },
    { link: 'reports', icon: 'assets/images/icons/report.svg', title: 'Reports' },
    { link: 'bam', icon: 'assets/images/icons/analytics.svg', title: 'BAM' },
    { link: 'search', icon: 'assets/images/icons/search.svg', title: 'Search' },
    { link: 'delegation', icon: 'assets/images/icons/delegate.svg', title: 'Delegate' },
  ];
  userNav = [
    //{ link: '#', title: 'User Profile' },
    { link: '#', title: 'Log out' },
  ];
  userName = "";

  constructor(private route: Router, private authService: AuthService) { }

  ngOnInit(): void {
    // Subscribe to the currentUser observable
    this.authService.CurrentUser.subscribe(user => {
      this.userName = user;
    });

    this.route.events.subscribe(() => {
      this.showMenu = this.route.url !== '/landing';
    });
  }
  onLogout(event: Event) {
    event.preventDefault();
    this.authService.logout();
  }
}
