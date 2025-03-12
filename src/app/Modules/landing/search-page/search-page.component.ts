import { Component } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { LookupsService } from '../../../services/lookups.service';
import { SearchPageService } from '../../../services/search-page.service';
import { ToasterService } from '../../../services/toaster.service';
import { User } from '../../../models/user.model';
import { Entity } from '../../../models/searchEntity.model';
import { SearchFilter } from '../../../models/searchFilter.model';
import { DelegationToUsers } from '../../../models/delegationTo.model';
import { ActivityLogResponse } from '../../../models/activity.model';
import { DocAttributesApiResponse } from '../../../models/searchDocAttributes.model';
import { SearchResponse } from '../../../models/searchresponse.model';
import { AttachmentsApiResponce } from '../../../models/attachments.model';
import { MatDialog } from '@angular/material/dialog';
import { MailDetailsDialogComponent } from '../mail-details-dialog/mail-details-dialog.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';
import { Category } from '../../../models/category.model';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss',
  standalone: false,
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({ height: '0px', opacity: 0 }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1 }),
        animate('300ms ease-in', style({ height: '0px', opacity: 0 }))
      ])
    ])
  ]
})
export class SearchPageComponent {
  regmodel: NgbDateStruct | undefined;
  fromModal: NgbDateStruct | undefined;
  tomodel: NgbDateStruct | undefined;

  accessToken: string | null = null;

  searchModel: SearchFilter = new SearchFilter();
  isLoadingFromUsers = false;
  searchFromUsers: Partial<User>[] = [];
  searchToUsers: Partial<User>[] = [];
  delegationUsers: Partial<DelegationToUsers>[] = [];
  entities: Partial<Entity>[] = [];
  // sendingEntities: Partial<Entity>[] = [];
  recEntities: Partial<Entity>[] = [];
  // transferFromEntities: Partial<Entity>[] = [];
  // transferToEntities: Partial<Entity>[] = [];
  response: SearchResponse | null = null;
  dtOptions: DataTables.Settings = {};
  categories: any[] = [];
  priorities: any[] = [];
  privacies: any[] = [];
  importances: any[] = [];
  statuses: any[] = [];

  sendingEntities: any[] = [];
  filteredSendingEntities: any[] = [];
  isLoadingEntities = false;

  receivingEntities: any[] = [];
  filteredReceivingEntities: any[] = [];

  transferToEntities: any[] = [];
  transferFromEntities:any[] = [];
  filteredTransferToEntities: any[] = [];
  filteredTransferFromEntities: any[] = [];

  transferToUser: any[] = [];
  transferFromUser:any[] = [];
  filteredTransferToUser: any[] = [];
  filteredTransferFromUser: any[] = [];

  // filteredSendingEntities: Entity[] = []
  searchTerm = new FormControl(''); // Reactive form control for the search input
  notes: any[] = [];
  linkedDocs: any[] = [];
  nonArchAttachments: any[] = [];
  transHistory: any[] = [];
  activityLogs: ActivityLogResponse[] = [];
  attributes: DocAttributesApiResponse | null = null;
  attachments: AttachmentsApiResponce[] | null = [];
  visualTracking: any[] = [];

  loading: boolean = true; // Loading state
  formVisible = true;
  minToDate: Date | null = null;


  constructor(
    private searchService: SearchPageService,
    private router: Router,
    private lookupservice: LookupsService,
    private authService: AuthService,
    private toaster: ToasterService,
    private dialog: MatDialog,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    //this.regmodel = { year: 2025, month: 1, day: 21 };
    //this.fromModal = { year: 2025, month: 1, day: 21 };
    //this.tomodel = { year: 2025, month: 1, day: 22 };


    this.accessToken = this.authService.getToken();
    if (!this.accessToken) {
      this.router.navigate(['/login']);
      return;
    }

    this.searchTerm.valueChanges.pipe(debounceTime(300)).subscribe(searchText => {
      if (searchText && searchText.length > 0) { // Ensure searchText is not null
        this.getFromUsers(searchText);
      } else {
        this.searchFromUsers = []; // Clear results when input is empty
      }
    });


    this.initDtOptions();

    //this.getEntites('');
    this.getSendingEntities('');
    this.getReceivingEntites('');
    this.getFromUsers('');
    this.getToUsers('');
    this.getTransferFromEntites('');
    this.getTransferToEntities('');
    this.getDelegationUsers();
    this.getCategories();
    this.getImportance();
    this.getPriorities();
    this.getStatuses();
    this.getPrivacies();
  }

  getSendingEntities(searchText: string | null = ''): void {
    this.isLoadingEntities = true;
    this.lookupservice.getEntities().subscribe({
      next: (response) => {
        this.sendingEntities = response || [];
        console.log('Sending entities:', this.sendingEntities);
        console.log('Search text:', searchText);
  
        // Add a default option at the top of the list
        // this.sendingEntities.unshift({
        //   id: 0,
        //   name: this.translate.instant('SEARCH.FORM.SELECT_ENTITY')
        // });
  
        // Apply search filter
        this.filterSendingEntities(searchText ?? '');
  
        // Ensure default selection
        if (!this.searchModel.documentSender) {
          this.searchModel.documentSender = "0";
        }
  
        this.isLoadingEntities = false;
      },
      error: (error) => {
        console.error('Error fetching entities:', error);
        this.isLoadingEntities = false;
      }
    });
  }
  
  // onSendingEntityDropdownOpen() {
  //   if (this.sendingEntities.length > 0) {
  //     this.filteredSendingEntities = [...this.sendingEntities];
  //   } else {
  //     this.getSendingEntities();
  //   }
  // }
  
  
  filterSendingEntities(searchText: string) {
    searchText = searchText.trim().toLowerCase(); // Ensure case-insensitive search
  
    if (!searchText) {
      this.filteredSendingEntities = [...this.sendingEntities];
      return;
    }
  
    this.filteredSendingEntities = this.sendingEntities.filter(entity =>
      entity.name.toLowerCase().includes(searchText) // Use `includes()` instead of `startsWith()`
    );
  }
  


  getReceivingEntites(searchText: string | null): void {
    this.isLoadingEntities = true;
    this.lookupservice.getEntities().subscribe({
      next: (response) => {
        this.receivingEntities = response || [];
        console.log('Search text:', searchText);
  
        // Add a default option at the top of the list
        // this.receivingEntities.unshift({
        //   id: 0,
        //   name: this.translate.instant('SEARCH.FORM.SELECT_ENTITY')
        // });
  
        // Apply search filter
        this.filterReceivingEntities(searchText ?? '');
  
        // Ensure default selection
        if (!this.searchModel.documentReceiver) {
          this.searchModel.documentReceiver = "0";
        }
  
        this.isLoadingEntities = false;
      },
      error: (error) => {
        console.error('Error fetching entities:', error);
        this.isLoadingEntities = false;
      }
    });
  }
  
  filterReceivingEntities(searchText: string) {
    searchText = searchText.trim().toLowerCase(); // Ensure case-insensitive search
  
    if (!searchText) {
      this.filteredReceivingEntities = [...this.receivingEntities];
      return;
    }
  
    this.filteredReceivingEntities = this.receivingEntities.filter(entity =>
      entity.name.toLowerCase().startsWith(searchText) // Use `includes()` instead of `startsWith()`
    );
  }
  
  

  getTransferFromEntites(searchText: string): void {
    this.isLoadingEntities = true;
    this.lookupservice.getEntities().subscribe({
      next: (response) => {
        this.transferFromEntities = response || [];
        console.log('Search text:', searchText);
  
        // Add a default option at the top of the list
        // this.transferFromEntities.unshift({
        //   id: 0,
        //   name: this.translate.instant('SEARCH.TRANSFER.FROM_STRUCTURE')
        // });
  
        // Apply search filter
        this.filterTransferFromEntities(searchText ?? '');
  
        // Ensure default selection
        if (!this.searchModel.fromStructure) {
          this.searchModel.fromStructure = "0";
        }
  
        this.isLoadingEntities = false;
      },
      error: (error) => {
        console.error('Error fetching entities:', error);
        this.isLoadingEntities = false;
      }
    });
  }

  filterTransferFromEntities(searchText: string) {
    searchText = searchText.trim().toLowerCase(); // Ensure case-insensitive search
  
    if (!searchText) {
      this.filteredTransferFromEntities = [...this.transferFromEntities];
      return;
    }
  
    this.filteredTransferFromEntities = this.transferFromEntities.filter(entity =>
      entity.name.toLowerCase().startsWith(searchText) // Use `includes()` instead of `startsWith()`
    );
  }
  


  getTransferToEntities(searchText: string): void {
    this.isLoadingEntities = true;
    this.lookupservice.getEntities().subscribe({
      next: (response) => {
        this.transferToEntities = response || [];
        console.log('Search text:', searchText);
  
        // // Add a default option at the top of the list
        // this.transferToEntities.unshift({
        //   id: 0,
        //   name: this.translate.instant('SEARCH.FORM.SELECT_ENTITY')
        // });
  
        // Apply search filter
        this.filterTransferToEntities(searchText ?? '');
  
        // Ensure default selection
        if (!this.searchModel.toStructure) {
          this.searchModel.toStructure = "0";
        }
  
        this.isLoadingEntities = false;
      },
      error: (error) => {
        console.error('Error fetching entities:', error);
        this.isLoadingEntities = false;
      }
    });
  }

  filterTransferToEntities(searchText: string) {
    searchText = searchText.trim().toLowerCase(); // Ensure case-insensitive search
  
    if (!searchText) {
      this.filteredTransferToEntities = [...this.transferToEntities];
      return;
    }
  
    this.filteredTransferToEntities = this.transferToEntities.filter(entity =>
      entity.name.toLowerCase().startsWith(searchText) // Use `includes()` instead of `startsWith()`
    );
  }

  isLoadingFromUsers = false;
  getFromUsers(searchText: string): void {
    this.isLoadingEntities = true;
    this.lookupservice.getUsers(this.accessToken!).subscribe({
      next: (response) => {
        this.transferFromUser = response || [];
        console.log('Search text:', searchText);
  
        this.filterTransferFromUser(searchText ?? '');
  
        // Ensure default selection
        if (!this.searchModel.fromUser) {
          this.searchModel.fromUser = "0";
        }
  
        this.isLoadingEntities = false;

      },
      error: (error) => {
        console.error('Error fetching entities:', error);
        this.isLoadingEntities = false;
      }
    });
  }
  filterTransferFromUser(searchText: string) {
    searchText = searchText.trim().toLowerCase(); // Ensure case-insensitive search
  
    if (!searchText) {
      this.filteredTransferFromUser = [...this.transferFromUser];
      return;
    }
  
    this.filteredTransferFromUser = this.transferFromUser.filter(entity =>
      entity.name.toLowerCase().startsWith(searchText) // Use `includes()` instead of `startsWith()`
    );
  }
  
  getToUsers(searchText: string): void {
    this.isLoadingEntities = true;
    this.lookupservice.getUsers(this.accessToken!).subscribe({
      next: (response) => {
        this.transferToUser = response || [];
        console.log('Search text:', searchText);
  
        this.filterTransferToUser(searchText ?? '');
  
        // Ensure default selection
        if (!this.searchModel.toUser) {
          this.searchModel.toUser = "0";
        }
  
        this.isLoadingEntities = false;

      },
      error: (error) => {
        console.error('Error fetching entities:', error);
        this.isLoadingEntities = false;
      }
    });
  }

  
  filterTransferToUser(searchText: string) {
    searchText = searchText.trim().toLowerCase(); // Ensure case-insensitive search
  
    if (!searchText) {
      this.filteredTransferToUser = [...this.transferToUser];
      return;
    }
  
    this.filteredTransferToUser = this.transferToUser.filter(entity =>
      entity.name.toLowerCase().startsWith(searchText) 
    );
  }

  getDelegationUsers(): void {
    this.lookupservice.getDelegationToUsers(this.accessToken!).subscribe(
      (response) => {
        this.delegationUsers = response || [];
        this.delegationUsers.unshift({ id: 0, fromUser: 'My Inbox' });
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  getCategories(): void {
    this.lookupservice.getCategoriesByName(undefined).subscribe(
      (response: any) => {
        this.categories = response?.data || [];

      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  getStatuses(): void {
    this.lookupservice.getStatusByName().subscribe(
      (response) => {
        this.statuses = response || [];

      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  getPrivacies(): void {
    this.lookupservice.getPrivacy(this.accessToken!).subscribe(
      (response) => {
        this.privacies = response || [];

      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  getImportance(): void {
    this.lookupservice.getImportance(this.accessToken!).subscribe(
      (response) => {
        this.importances = response || [];

      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  getPriorities(): void {
    this.lookupservice.getPriorities(this.accessToken!).subscribe(
      (response) => {
        this.priorities = response || [];

      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  convertToNgbDateStruct(dateStr: string): NgbDateStruct | undefined {
    if (!dateStr) return undefined;
    const [day, month, year] = dateStr.split('/');
    return { year: +year, month: +month, day: +day };
  }

  initDtOptions(): void {
    this.dtOptions = {
      pageLength: 10,
      pagingType: 'full_numbers',
      paging: true,
      searching: false,
      autoWidth: false,
      language: {
        paginate: {
          first: "<i class='text-secondary fa fa-angle-double-left'></i>",
          previous: "<i class='text-secondary fa fa-angle-left'></i>",
          next: "<i class='text-secondary fa fa-angle-right'></i>",
          last: "<i class='text-secondary fa fa-angle-double-right'></i>",
        },
      },
      dom: 'tp',
      ordering: false,
      drawCallback: (settings: any) => {
        const api = settings.oInstance.api();
        const pageInfo = api.page.info();
        const pagination = $(api.table().container()).find('.dataTables_paginate');
        pagination.find('input.paginate-input').remove();
        const page = $('<span class="d-inline-flex align-items-center mx-2">' + this.translate.instant('COMMON.PAGE') + '<input type="number" class="paginate-input form-control form-control-sm mx-2" min="1" max="' + pageInfo.pages + '" value="' + (pageInfo.page + 1) + '"> ' + this.translate.instant('COMMON.OF') + ' ' + pageInfo.pages + '</span>');


        let timeout: any;
        page.find('input').on('keyup', function () {
          clearTimeout(timeout);

          timeout = setTimeout(() => {
            const pageNumber = parseInt($(this).val() as string, 10);
            if (pageNumber >= 1 && pageNumber <= pageInfo.pages) {
              api.page(pageNumber - 1).draw('page');
            }
          }, 500);
        });

        const previous = pagination.find('.previous');
        const next = pagination.find('.next');
        page.insertAfter(previous);
        next.insertAfter(page);

        pagination.find('a.paginate_button').on('click', function () {
          page.find('input').val(api.page() + 1);
        });
      }
    };
  }

  formatDate(date: NgbDateStruct | Date | string): string {
    if (!date) return '';
  
    let parsedDate: Date;
  
    if (typeof date === 'string') {
      parsedDate = new Date(date);
    } else if ('year' in date) {
      parsedDate = new Date(date.year, date.month - 1, date.day);
    } else {
      parsedDate = date;
    }
  
    if (isNaN(parsedDate.getTime())) return '';
  
    const day = parsedDate.getDate().toString().padStart(2, '0');
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = parsedDate.getFullYear().toString();
  
    return `${year}/${month}/${day}`;
  }
  
  onSearch() {
    console.log(this.searchModel);
    const formattedSearchModel = { ...this.searchModel };

    // Change IDs sent by zero to empty & format dates
    (Object.keys(formattedSearchModel) as (keyof SearchFilter)[]).forEach((key) => {
      if (key !== "delegationId" && typeof formattedSearchModel[key] === "string" && formattedSearchModel[key] === "0") {
        (formattedSearchModel[key] as string) = "";
      }

      // Check if the key corresponds to one of the date fields that need to be formatted
      if (key === "fromTransferDate" || key === "toTransferDate" || key === "DocumentDate") {
        const value = formattedSearchModel[key];

        // Check if the value is a NgbDateStruct
        if (value && typeof value !== "string" && (value as NgbDateStruct).year) {
          const date = value as NgbDateStruct;
          formattedSearchModel[key] = this.formatDate(date);  // Convert to "yyyy/mm/dd"
        }
      }
    });

    this.searchService.searchInbox(this.accessToken!, formattedSearchModel).subscribe((result: SearchResponse) => {
      this.response = result;
      console.log(this.response.recordsTotal)
      this.response.data.forEach(item => {

        item.categoryText = item.categoryId != null ? this.categories[item.categoryId - 1].text : '';
        item.statusText = item.statusId != null ? this.statuses[item.statusId - 1].text : '';
        item.priorityText = item.priorityId != null ? this.priorities[item.priorityId - 1].text : '';
        item.privacyText = item.privacyId != null ? this.privacies[item.privacyId - 1].text : '';
        item.importanceText = item.importanceId != null ? this.importances[item.importanceId - 1].text : '';
      },
        (error: any) => {
          console.error('Error getting search result:', error);
          this.toaster.showToaster(error?.message || 'Something went wrong');
        });
    });

    

  }
  
  isValidNgbDateStruct(value: NgbDateStruct): boolean {
    return (
      value &&
      typeof value.year === "number" &&
      typeof value.month === "number" &&
      typeof value.day === "number"
    );
  }

  ResetForm() {
    this.searchModel.delegationId = "0";
    this.searchModel.toUser = "0";
    this.searchModel.fromUser = "0";
    this.searchModel.documentReceiver = "0";
    this.searchModel.documentSender = "0";
    this.searchModel.toStructure = "0";
    this.searchModel.fromStructure = "0";
  }

  clearForm() {
    this.searchModel = new SearchFilter();
    this.response = null;
    this.ResetForm();

    this.getSendingEntites('');
    this.getReceivingEntites('');
    this.getFromUsers('');
    this.getToUsers('');
    this.getTransferFromEntites('');
    this.getTransferToEntities('');
  }

  getCategoryName(catId: any): string {
    const cat = this.categories.find(p => p.id === catId);
    return cat ? this.getName(cat) : '';
  }

  getStatusName(id: any): string {
    debugger;
    const status = this.statuses.find(p => p.id === id);
    return status ? this.getName(status) : '';
  }

  async showDetails(row: any) {
    localStorage.setItem('current_Tab','search');
    this.dialog.open(MailDetailsDialogComponent, {
      disableClose: true,
      width: '90%',
      height: '90%',
      data: {
        id: row.id,
        documentId: row.documentId,
        referenceNumber: row.ref,
        row: row,
        fromSearch: false
      }
    }).componentInstance.showMyTransferTab = false; // Set showMyTransferTab to false

  } catch(error: any) {
    console.error("Error loading data", error);
  }

  // To get lookup names based on language
  getName(item: any): string {

    const currentLang = this.translate.currentLang;
    switch (currentLang) {
      case 'ar':
        return item?.nameAr || item?.name;
      case 'fr':
        return item?.nameFr || item?.name;
      default:
        return item?.name;
    }
  }

  onSearchSendingEntites(searchText: string | null): void {
    if (searchText === null) {
      searchText = ''; // Ensure it's always a string


    }
  
    console.log('Search text:', searchText);
  
    this.filteredSendingEntities = this.sendingEntities.filter(entity =>
      entity.name.toLowerCase().startsWith(searchText.toLowerCase())
    );
  }
  
  onSearchReceivingEntites(searchText: string | null): void {
    if (searchText === null) {
      searchText = ''; // Ensure it's always a string
    }
  
    console.log('Search text:', searchText);
  
    this.filteredReceivingEntities = this.receivingEntities.filter(entity =>
      entity.name.toLowerCase().startsWith(searchText.toLowerCase())
    );
  }


  onSearchReceivingEntitesold(event: { term: string; items: any[] }): void {
    const query = event.term;
    if (query.length >=1) {
      this.loading = true;
      this.getReceivingEntites(query);
    }
    else {
      this.loading = true;
      this.getReceivingEntites('');




  onSearchTransferFromEntites(searchText: string | null): void {
    if (searchText === null) {
      searchText = ''; // Ensure it's always a string

    }
  
    console.log('Search text:', searchText);
  
    this.filteredTransferFromEntities = this.transferFromEntities.filter(entity =>
      entity.name.toLowerCase().startsWith(searchText.toLowerCase())
    );
  }

  onSearchTransferToEntites(searchText: string | null): void {
    if (searchText === null) {
      searchText = ''; // Ensure it's always a string
    }
  
    console.log('Search text:', searchText);
  
    this.filteredTransferToEntities = this.transferToEntities.filter(entity =>
      entity.name.toLowerCase().startsWith(searchText.toLowerCase())
    );
  }
  // onSearchUsers(event: { term: string; items: any[] } | string | null, fromUsersFilter: boolean): void {
  //   let searchText = typeof event === 'string' ? event : event?.term || '';
  
  //   if (!searchText) {
  //     searchText = ''; // Ensure it's always a string
  //   }
  
  //   console.log('Search text:', searchText);
  
  //   if (searchText.length > 0) {
  //     this.loading = true;
  //     if (fromUsersFilter) {
  //       this.filteredTransferFromUser = this.transferFromUser.filter(user =>
  //         user.fullName.toLowerCase().startsWith(searchText.toLowerCase())
  //       );
  //     } else {
  //       this.searchToUsers = this.transferToUser.filter(user =>
  //         user.fullName.toLowerCase().startsWith(searchText.toLowerCase())
  //       );
  //     }
  //   } else {
  //     this.loading = false;
  //     this.filteredTransferFromUser = this.transferFromUser; // Reset to full list
  //     this.searchToUsers = this.transferToUser; // Reset to full list
  //   }
  // }



  onSearchFromUser(event: { term: string; items: any[] } | string | null): void {
    let searchText = typeof event === 'string' ? event : event?.term || '';
  
    if (!searchText) {
      searchText = ''; // Ensure it's always a string

    }
  
    console.log('Search From User:', searchText);
  
    if (searchText.length > 0) {
      this.loading = true;
      this.filteredTransferFromUser = this.transferFromUser.filter(user =>
        user.fullName.toLowerCase().startsWith(searchText.toLowerCase())
      );
    } else {
      this.loading = false;
      this.filteredTransferFromUser = this.transferFromUser; // Reset to full list
    }
  }

  onSearchToUser(event: { term: string; items: any[] } | string | null): void {
    let searchText = typeof event === 'string' ? event : event?.term || '';
  
    if (!searchText) {
      searchText = ''; // Ensure it's always a string
    }
  
    console.log('Search To User:', searchText);
  
    if (searchText.length > 0) {

      this.loading = true;
      this.filteredTransferToUser = this.transferToUser.filter(user =>
        user.fullName.toLowerCase().startsWith(searchText.toLowerCase())
      );
    } else {
      this.loading = false;
      this.filteredTransferToUser = this.transferToUser; // Reset to full list
    }
  }
  


  toggleSearchForm() {
    this.formVisible = !this.formVisible;
  }

  onFromDateChange():void{
    if(this.searchModel.fromTransferDate){
      this.minToDate = new Date(this.searchModel.fromTransferDate);
    }else{
      this.minToDate = null ;
    }

    console.log(this.minToDate)
  }

  preventTyping(event :KeyboardEvent):void{
    console.log('clickkkked')
    if(!(event.ctrlKey && event.key ==='v')&& !(['Delete','Backspace','Tap','ArrowLeft',"ArrowRight"].includes(event.key))){
      event.preventDefault();
    }
  }
}
