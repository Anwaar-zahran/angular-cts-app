import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToasterService } from '../../../services/toaster.service';
import { StructuresService } from '../../../services/structures.service';
import { jwtDecode } from 'jwt-decode';
import { CurrentUserStructures } from '../../../models/current-user-structures';
import { DisplayStructure } from '../../../models/display-structure';
import { ConfirmationmodalComponent } from '../confirmationmodal/confirmationmodal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: false
})
export class HeaderComponent implements OnInit {
  currentLang: string;
  userInfo = { name: "Fatima AliAhmad", Job: "Frontend Developer", ID: 1234, image: null }
  showMenu: boolean = true;
  MainnavItems = [
    { link: 'MyMail', icon: 'assets/images/icons/email.svg', title: 'LANDING.CARDS.MY_MAIL' },
    { link: 'Guidelines', icon: 'assets/images/icons/Union.svg', title: 'LANDING.CARDS.GUIDELINES' },
    { link: 'mail', icon: 'assets/images/icons/signature-with-a-pen.svg', title: 'LANDING.CARDS.SIGNATURE' },
    { link: 'reports', icon: 'assets/images/icons/report.svg', title: 'LANDING.CARDS.REPORTS' },
    { link: 'bam', icon: 'assets/images/icons/analytics.svg', title: 'LANDING.CARDS.BAM' },
    { link: 'search', icon: 'assets/images/icons/search.svg', title: 'LANDING.CARDS.SEARCH' },
    { link: 'delegation', icon: 'assets/images/icons/delegate.svg', title: 'LANDING.CARDS.DELEGATE' },
  ];

  userNav = [
    { link: '#', title: 'HEADER.USER_NAV.LOGOUT' }
  ];


  structuresItems2: CurrentUserStructures[] = [];
  structuresItems: DisplayStructure[] = [];
  structure!:string;

  languages = [
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'ar', name: 'العربية', dir: 'rtl' }
  ];

  userName = "";

  constructor(
    private route: Router,
    private authService: AuthService,
    private translateService: TranslateService,
    private modalService: NgbModal,
    private structuresService: StructuresService

  ) {
    this.currentLang = this.translateService.currentLang || 'en';
    this.structure = this.translateService.instant("BAM.DASHBOARD.CHARTS.LABELS.STRUCTURES");
    this.translateService.onLangChange.subscribe((event) => {
      console.log('Language changed to: ', event.lang);
      debugger;
     // this.switchLanguage(event.lang);
      this.translateService.setDefaultLang(event.lang);
      this.translateService.use(event.lang); // Set initial language to English
    });
    this.translateService.setDefaultLang('en');

  }

  ngOnInit(): void {
    console.log('HeaderComponent ngOnInit');
    this.authService.CurrentUser.subscribe(user => {
      this.userName = user;
    });
    this.route.events.subscribe(() => {
      this.showMenu = this.route.url !== '/landing';
    });

  
    this.loadStructures();
  }



  onLogout(event: Event) {
    event.preventDefault();
    this.authService.logout();
    console.log('Logged out');
  }

  switchLanguage(lang: string) {
    debugger;
    this.translateService.use(lang);
    localStorage.setItem('language', lang);
    this.currentLang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    window.location.reload();
  }

  getCurrentLangName(): string {
    return this.languages.find(lang => lang.code === this.currentLang)?.name || 'English';
  }


  private loadStructures() {
    let userTypeId = this.authService.getUserTypeId();
    console.log('User Type Id:', userTypeId);
    if (!userTypeId) {
      return;
    }

    this.structuresService.getLoggedInStructure().subscribe({
      next: (loggedInStructureId: number) => {
        this.structuresService.getStructureById(userTypeId).subscribe({
          next: (response: CurrentUserStructures) => {

            console.log('Response:', response);
            const structures = response.structures;

            localStorage.setItem('currentUser', response.fullName);
            const localStorageStructureId = localStorage.getItem('structureId');

            structures.forEach((structure) => {

              this.structuresItems.push({
                name: structure.name,
                active: structure.id === loggedInStructureId,
                StructureId: structure.id
              });
            });


            if (localStorageStructureId != loggedInStructureId.toString()) {
              localStorage.setItem('structureId', loggedInStructureId.toString());
              window.location.reload();
            }

          },
          error: (error) => {
            console.log('Error fetching structure:', error.message);
          },
          complete: () => {
            console.log('Request completed.');
          }
        });
      }
    });


  }

  onStructureChange(structureId: number) {
    if (structureId) {
      debugger;
      const modalRef = this.modalService.open(ConfirmationmodalComponent);

      this.translateService.get('HEADER.CONFIRMMODAL.MESSAGE').subscribe((msg: string) => {
        modalRef.componentInstance.message = msg;
        this.translateService.get('COMMON.ACTIONS.CANCEL').subscribe((cancelLabel: string) => {
          modalRef.componentInstance.cancelLabel = cancelLabel;
        });
        this.translateService.get('COMMON.ACTIONS.CONFIRM').subscribe((confirmLabel: string) => {
          modalRef.componentInstance.confirmLabel = confirmLabel;
        });
      });

      modalRef.componentInstance.confirmed.subscribe(() => {
        this.updateStructure(structureId, true);
      });
    }
  }

  private updateStructure(structureId: number, shouldRedirectToLanding: boolean) {
    debugger
    let CurrentUserStructures = this.structuresItems.find(structure => structure.active == true);
    let newUserStructures = this.structuresItems.find(structure => structure.StructureId === structureId);

    this.structuresItems.forEach(structure => structure.active = false);

    if (newUserStructures) {
      newUserStructures.active = true;
    }

    let oldStructureId: string = localStorage.getItem('structureId') || CurrentUserStructures?.StructureId.toString() || '1';


    this.updateActiveStructure(structureId, oldStructureId, shouldRedirectToLanding);
  }

  updateActiveStructure(structureId: number, oldStructureId: string, shouldRedirectToLanding: boolean) {
    let token: string = localStorage.getItem("access_token") || '';
    this.structuresService.UpdateLoggedInStrucure(structureId.toString(), oldStructureId, token)
      .subscribe({
        next: (response) => {
          localStorage.setItem('structureId', structureId.toString());
          if (shouldRedirectToLanding) {
            this.route.navigate(['/landing']);
          }
        },
        error: (error) => console.error('Error updating structure:', error)
      });
  }

}
