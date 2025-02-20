import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
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
  }

  ngOnInit(): void {

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

  
  private loadStructures(){
    let userTypeId = this.authService.getUserTypeId();
    console.log('User Type Id:', userTypeId);
    if(!userTypeId){
      return;
    }

    this.structuresService.getStructureById(userTypeId).subscribe({
      next: (response:CurrentUserStructures) => {

        console.log('Response:', response);
        const structures = response.structures;

        localStorage.setItem('currentUser', response.fullName);
        structures.forEach((structure) => {

          this.structuresItems.push({ 
            name: structure.name,
            active: response.defaultStructureId == structure.id,
            StructureId: structure.id });
        });
        
      },
      error: (error) => {
        console.log('Error fetching structure:', error.message);
      },
      complete: () => {
        console.log('Request completed.');
      }
    });
  }

  onStructureChange(structureId: number) {
    if(structureId){
    const modalRef = this.modalService.open(ConfirmationmodalComponent);
   //Are you sure to change the structure
    this.translateService.get('HEADER.CONFIRMMODAL.MESSAGE').subscribe((msg: string) => {
      modalRef.componentInstance.message = msg;
       // Pass translated button labels for "Cancel" and "Confirm"
      this.translateService.get('COMMON.ACTIONS.CANCEL').subscribe((cancelLabel: string) => {
        modalRef.componentInstance.cancelLabel = cancelLabel;
      });
      this.translateService.get('COMMON.ACTIONS.CONFIRM').subscribe((confirmLabel: string) => {
        modalRef.componentInstance.confirmLabel = confirmLabel;
      });
    });
    modalRef.componentInstance.confirmed.subscribe(()=>{
      let CurrentUserStructures = this.structuresItems.find(structure => structure.StructureId === structureId);
      this.structuresItems.forEach(structure => structure.active = false);
     // let currentUserStructure = this.structuresItems.find(structure => structure.StructureId === structureId);
      if (CurrentUserStructures) {
      CurrentUserStructures.active = true;
      }
      localStorage.setItem('structureId', structureId.toString());
      // Navigate to the landing page WITHOUT manually calling reloadData()
      // this.route.navigate(['/landing']);
      this.route.navigate(['/landing']).then(() => {
       // this.updateActiveStructure();
      });
    })
     
    }
  }
  updateActiveStructure() {
    debugger
    const savedStructureId = localStorage.getItem('structureId');
  
    if (savedStructureId) {
      const savedId = Number(savedStructureId);
  
      // Update the active structure based on stored value
      this.structuresItems.forEach(structure => {
        structure.active = structure.StructureId === savedId;
      });
    }
  }
  
}