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

  searchFromUsers: Partial<User>[] = [];
  searchToUsers: Partial<User>[] = [];
  delegationUsers: Partial<DelegationToUsers>[] = [];
  entities: Partial<Entity>[] = [];
  sendingEntities: Partial<Entity>[] = [];
  recEntities: Partial<Entity>[] = [];
  transferFromEntities: Partial<Entity>[] = [];
  transferToEntities: Partial<Entity>[] = [];
  response: SearchResponse | null = null;
  dtOptions: DataTables.Settings = {};
  categories: any[] = [];
  priorities: any[] = [];
  privacies: any[] = [];
  importances: any[] = [];
  statuses: any[] = [];

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
    this.initDtOptions();

    //this.getEntites('');
    this.getSendingEntites('');
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

  getSendingEntites(searchText: string): void {
    this.lookupservice.getSearchableEntities(searchText).subscribe(
      (response) => {
        this.sendingEntities = response || [];
        this.sendingEntities.unshift({ id: 0, name: 'Select Entity' });
        //this.searchModel.documentReceiver = "0";
        this.searchModel.documentSender = "0";
        //this.searchModel.toStructure = "0";
        //this.searchModel.fromStructure = "0";
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  getReceivingEntites(searchText: string): void {
    this.lookupservice.getSearchableEntities(searchText).subscribe(
      (response) => {
        this.recEntities = response || [];
        this.recEntities.unshift({ id: 0, name: 'Select Entity' });
        this.searchModel.documentReceiver = "0";
        //this.searchModel.documentSender = "0";
        //this.searchModel.toStructure = "0";
        //this.searchModel.fromStructure = "0";
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  getTransferFromEntites(searchText: string): void {
    this.lookupservice.getSearchableEntities(searchText).subscribe(
      (response) => {
        this.transferFromEntities = response || [];
        this.transferFromEntities.unshift({ id: 0, name: 'Select Entity' });
        //this.searchModel.documentReceiver = "0";
        //this.searchModel.documentSender = "0";
        //this.searchModel.toStructure = "0";
        this.searchModel.fromStructure = "0";
      },
      (error: any) => {
        console.error(error);
      }
    );
  }
  getTransferToEntities(searchText: string): void {
    this.lookupservice.getSearchableEntities(searchText).subscribe(
      (response) => {
        this.transferToEntities = response || [];
        this.transferToEntities.unshift({ id: 0, name: 'Select Entity' });
        //this.searchModel.documentReceiver = "0";
        //this.searchModel.documentSender = "0";
        this.searchModel.toStructure = "0";
        //this.searchModel.fromStructure = "0";
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  getFromUsers(searchText: string): void {
    this.lookupservice.getSearchUsers(this.accessToken!, searchText).subscribe(
      (response) => {
        this.searchFromUsers = response || [];
        this.searchFromUsers.unshift({ id: 0, fullName: 'Select User' });
        this.searchModel.delegationId = "0";
        //this.searchModel.toUser = "0";
        this.searchModel.fromUser = "0";
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  getToUsers(searchText: string): void {
    this.lookupservice.getSearchUsers(this.accessToken!, searchText).subscribe(
      (response) => {
        this.searchToUsers = response || [];
        this.searchToUsers.unshift({ id: 0, fullName: 'Select User' });
        this.searchModel.delegationId = "0";
        this.searchModel.toUser = "0";
        //this.searchModel.fromUser = "0";
      },
      (error: any) => {
        console.error(error);
      }
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
    this.lookupservice.getStatus().subscribe(
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
  }

  getCategoryName(catId: any): string {
    const cat = this.categories.find(p => p.id === catId);
    return cat ? this.getName(cat) : '';
  }

  async showDetails(row: any) {
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

  onSearchSendingEntites(event: { term: string; items: any[] }): void {
    const query = event.term;
    if (query.length > 2) {
      this.loading = true;
      this.getSendingEntites(query);
    }
    else {
      this.loading = true;
      this.getSendingEntites('');

    }
  }

  onSearchReceivingEntites(event: { term: string; items: any[] }): void {
    const query = event.term;
    if (query.length > 2) {
      this.loading = true;
      this.getReceivingEntites(query);
    }
    else {
      this.loading = true;
      this.getReceivingEntites('');

    }
  }

  onSearchTransferFromEntites(event: { term: string; items: any[] }): void {
    const query = event.term;
    if (query.length > 2) {
      this.loading = true;
      this.getTransferFromEntites(query);
    }
    else {
      this.loading = true;
      this.getTransferFromEntites('');

    }
  }

  onSearchTransferToEntites(event: { term: string; items: any[] }): void {
    const query = event.term;
    if (query.length > 2) {
      this.loading = true;
      this.getTransferToEntities(query);
    }
    else {
      this.loading = true;
      this.getTransferToEntities('');

    }
  }

  onSearchUsers(event: { term: string; items: any[] }, fromUsersFilter: boolean): void {
    const query = event.term;
    if (query.length > 2) {
      this.loading = true;
      if (fromUsersFilter)
        this.getFromUsers(query);
      else
        this.getToUsers(query);
    } else {
      this.loading = true;
      this.getFromUsers('');
      this.getToUsers('');
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
