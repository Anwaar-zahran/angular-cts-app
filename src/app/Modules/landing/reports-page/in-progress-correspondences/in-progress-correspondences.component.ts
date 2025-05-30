import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiResponse } from '../../../../models/api-response.model';
import { InprogressCorrespondence } from '../../../../models/inprogress-correspondence.model';
import { Priority } from '../../../../models/priority.model';
import { Structure } from '../../../../models/structure.model';
import { User } from '../../../../models/user.model';
import { LookupsService } from '../../../../services/lookups.service';
import { ReportsService } from '../../../../services/reports.service';
import { StructuresService } from '../../../../services/structures.service';
import { UsersService } from '../../../../services/users.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-in-progress-correspondences',
  templateUrl: './in-progress-correspondences.component.html',
  styleUrls: ['./in-progress-correspondences.component.css'],
  standalone: false
})
export class InProgressCorrespondencesComponent implements OnInit, OnDestroy {

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  isDtInitialized: boolean = false;
  rerender: Subject<any> = new Subject<any>();

  selectedStructures: number[] = [];
  structures: Structure[] = [];
  filteredStructures: Structure[] = [];
  structureError: string = '';
  expandedRows: Set<any> = new Set();

  fromDate: Date | undefined; // or set to a specific date like { year: 2023, month: 1, day: 1 }
  //fromDate: NgbDateStruct | undefined;
  toDate: Date | undefined;
  minToDate: Date | null = null;

  selectedUsers: number[] = [];
  users: User[] = [];
  filteredUsers: User[] = [];
  userError: string = '';

  isOverdue: boolean = false;

  reports: InprogressCorrespondence[] = [];

  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  totalItems: number = 0;
  startIndex: number = 0;
  endIndex: number = 0;
  pages: number[] = [];

  // Datatable properties
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();

  userSearchText: string = '';

  private userSearchSubject = new Subject<string>();

  isLoadingUsers = false;

  structureSearchText: string = '';
  isLoadingStructures = false;
  private structureSearchSubject = new Subject<string>();

  privacyOptions: any[] = [];
  priorityOptions: Priority[] = [];
  selectedPrivacyId: number | null = null;
  selectedPriorityId: number | null = null;
  constructor(
    private router: Router,
    private reportsService: ReportsService,
    private usersService: UsersService,
    private structuresService: StructuresService,
    private lookupsService: LookupsService,
    private translate: TranslateService
  ) {
    // Setup user search debounce
    this.userSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchText => {
      this.filterUsers(searchText);
    });

    this.structureSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchText => {
      console.log('Search subject received:', searchText);
      this.filterStructures(searchText);
    });
  }

  ngOnInit() {
    this.selectedPrivacyId = null;
    this.selectedPriorityId = null;

    this.initDtOptions();
    this.loadStructures();
    this.loadReports();
    this.loadPrivacyOptions();
    this.loadPriorityOptions();
    this.loadUsers();

  }

  initDtOptions() {
    this.translate.get('COMMON').subscribe(translations => {
      this.dtOptions = {
        pageLength: 10,
        search: false,
        order: [],
        pagingType: 'full_numbers',
        paging: false,
        searching: false,
        displayStart: 0,
        autoWidth: false,
        language: {
          emptyTable: "",
          zeroRecords: "",
          info: "",
          infoEmpty: "",
          paginate: {
            first: "<i class='text-secondary fa fa-angle-double-left'></i>",
            previous: "<i class='text-secondary fa fa-angle-left'></i>",
            next: "<i class='text-secondary fa fa-angle-right'></i>",
            last: "<i class='text-secondary fa fa-angle-double-right'></i>",
          }
        },
        dom: "t",
        ordering: false
      };
    });
  }

  loadReports() {
    const params: any = {
      page: this.currentPage,
      pageSize: this.dtOptions.pageLength
    };

    if (this.selectedStructures?.length > 0) {
      params.structureIds = this.selectedStructures;
    }
    if (this.selectedUsers?.length > 0) {
      params.userIds = this.selectedUsers;
    }
    if (this.fromDate) {
      params.fromDate = this.formatDate(this.fromDate);
    }
    if (this.toDate) {
      params.toDate = this.formatDate(this.toDate);
    }
    if (this.isOverdue) {
      params.isOverdue = this.isOverdue;
    }
    if (this.selectedPrivacyId) {
      params.privacyId = this.selectedPrivacyId;
    }
    if (this.selectedPriorityId) {
      params.priorityId = this.selectedPriorityId;
    }

    console.log('Loading reports with params:', params);

    this.reportsService.listInProgressCorrespondences(params).subscribe({
      next: (response: ApiResponse<InprogressCorrespondence[]>) => {
        this.reports = response.data;
        this.totalItems = response.recordsTotal;

        console.log('reportssssss data from API')
        console.log(this.reports)
        this.calculatePagination();

        if (this.isDtInitialized) {
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.destroy();
            this.dtTrigger.next(null);
          });
        } else {
          this.isDtInitialized = true;
          this.dtTrigger.next(null);
        }
      },
      error: (error: any) => {
        console.error('Error loading reports:', error);
        this.reports = [];
        this.dtTrigger.next(null);
      }
    });
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.totalItems / this.dtOptions.pageLength);
    this.startIndex = (this.currentPage - 1) * this.dtOptions.pageLength + 1;
    this.endIndex = Math.min(this.startIndex + this.dtOptions.pageLength - 1, this.totalItems);

    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  toggleRow(row: any): void {
    if (this.expandedRows.has(row)) {
      this.expandedRows.delete(row);
    } else {
      console.log(row)
      this.expandedRows.add(row);
    }
  }

  isRowExpanded(row: any): boolean {
    return this.expandedRows.has(row);
  }

  loadStructures() {
    this.isLoadingStructures = true;
    this.structuresService.searchStructures('').subscribe({
      next: (structures) => {
      const  isArabic = this.translate.currentLang === 'ar';
        this.structures = (structures || []).map((item: any) => {
          // Extract StructureNameAr from attributes
          const structureNameAr = item.attributes?.find((attr: any) => attr.text === 'StructureNameAr')?.value || item.name;
    
          return {
            id: item.id,
            name: isArabic ? structureNameAr : item.name // Use StructureNameAr for Arabic, otherwise default to name
          };
        });
        //structures;
        this.filteredStructures = [...this.structures];
        this.isLoadingStructures = false;
      },
      error: (error) => {
        console.error('Error loading structures:', error);
        this.isLoadingStructures = false;
      }
    });
  }

  onStructureDropdownOpen() {
    if (this.structures && this.structures.length > 0) {
      this.filteredStructures = [...this.structures];
    } else {
      this.loadStructures();
    }
  }
  loadUsers() {
    this.isLoadingUsers = true;
    this.usersService.searchUsers('').subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...this.users];
        this.isLoadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoadingUsers = false;
      }
    });
  }

  onUserDropdownOpen() {
    if (this.users && this.users.length > 0) {
      this.filteredUsers = [...this.users];
    } else {
      this.loadUsers();
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  }

  joinStructureAndUser(structure: string, user: string): string {
    if (!structure && !user) return '';
    if (!structure) return user;
    if (!user) return structure;
    return `${structure} / ${user}`;
  }

  search() {
     
    const params: any = {
      page: this.currentPage || 1,
      pageSize: this.dtOptions.pageLength || 10,
      structureIds: this.selectedStructures?.length ? this.selectedStructures : undefined,
      userIds: this.selectedUsers?.length ? this.selectedUsers : undefined,
      fromDate: this.fromDate ? this.formatDate(this.fromDate) : undefined,
      toDate: this.toDate ? this.formatDate(this.toDate) : undefined,
      isOverdue: this.isOverdue !== undefined ? this.isOverdue : undefined,
      privacyId: this.selectedPrivacyId ? this.selectedPrivacyId : undefined,
      priorityId: this.selectedPriorityId ? this.selectedPriorityId : undefined
    };

    // Remove undefined properties
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });

    console.log('Search Parameters:', params); // Debugging line
    this.reportsService.listInProgressCorrespondences(params).subscribe({
      next: (response) => {

        this.reports = response.data;
        this.totalItems = response.recordsTotal;
        this.calculatePagination();
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        this.reports = [];
      }
    });
  }

  clear() {
     
    this.selectedStructures = [];
    this.selectedUsers = [];
    this.selectedPrivacyId = null;
    this.selectedPriorityId = null;
    this.fromDate = undefined;
    this.toDate = undefined;
    this.isOverdue = false;
    this.structureError = '';
    this.userError = '';
    this.userSearchText = '';
    this.structureSearchText = '';
    this.currentPage = 1;
    this.loadReports();
  }

  sort(column: string) {
    // TODO: Implement sorting by column
  }

  print() {
    window.print();
  }

  exportExcel() {
    // TODO: Implement Excel export
  }

  exportPdf() {
    // TODO: Implement PDF export
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  goToPage(page: number) {
    if ((page === 1 && this.currentPage === 1) || (page === this.totalPages && this.currentPage === this.totalPages)) {
      return;
    }
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadReports();
    }
  }

  onUserSearch(event: { term: string; items: any[] }) {
    let searchText = event.term.trim();
    this.isLoadingUsers = true;

    if (!searchText) {
      this.filteredUsers = [...this.users];
      this.isLoadingUsers = false;
      return;
    }

    searchText = searchText.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.fullName.toLowerCase().startsWith(searchText)
    );
    this.isLoadingUsers = false;
  }

  getUserDisplayName(user: User): string {
    return user.fullName || `${user.firstName} ${user.lastName}`.trim();
  }


  onStructureSearch(event: { term: string; items: Structure[] }) {
    let searchText = event.term.trim();
    this.isLoadingStructures = true;

    if (!searchText) {
      this.filteredStructures = [...this.structures];
      this.isLoadingStructures = false;
      return;
    }

    searchText = searchText.toLowerCase();
    this.filteredStructures = this.structures.filter(structure =>
      structure.name.toLowerCase().startsWith(searchText)
    );
    this.isLoadingStructures = false;
  }

  filterStructures(searchText: string) {
    if (!searchText) {
      this.filteredStructures = [...this.structures]; 
    } else {
      this.filteredStructures = this.structures.filter(structure =>
        structure.name.toLowerCase().startsWith(searchText)
      );
    }
    this.isLoadingStructures = false;
  }

  filterUsers(searchText: string) {
    if (!searchText) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(user =>
        user.fullName.toLowerCase().startsWith(searchText)
      );
    }
    this.isLoadingUsers = false;
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    if (this.isDtInitialized) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
    this.dtTrigger.unsubscribe();
    this.rerender.unsubscribe();
    this.userSearchSubject.complete();
    this.structureSearchSubject.complete();
  }

  loadPrivacyOptionsWithoutTranslate() {
    this.lookupsService.getPrivacyOptions().subscribe({
      next: (options) => {
        this.privacyOptions = options;
      },
      error: (error) => {
        console.error('Error loading privacy options:', error);
      }
    });
  }
  loadPrivacyOptions() {
     
    this.lookupsService.getPrivacy('').subscribe({
      next: (options) => {
        this.privacyOptions = options;
        //this.privacyOptions = options.map(option => {
        //const formattedKey = option.name.trim().toLowerCase().replace(/\s+/g, ' '); // Remove extra spaces
        // return {
        //   ...option,
        //   translatedName: this.translate.instant(`PrivacyOptions.${formattedKey}`) || option.name // Translate option name
        // };
        //});
      },
      error: (error) => {
        console.error(this.translate.instant('ERROR.LOADING_PRIVACY_OPTIONS'), error);
      }
    });
  }

  loadPriorityOptions() {
    this.lookupsService.getPriorityOptions('').subscribe({
      next: (options) => {
        debugger
        this.priorityOptions = options;
      },
      error: (error) => {
        console.error('Error loading priority options:', error);
      }
    });
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

  preventTyping(event: KeyboardEvent): void {
    if (!(event.ctrlKey && event.key === 'v') && !(['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab']).includes(event.key)) {
      event.preventDefault();
    }
  }

  onFormDateChange(): void {
    if (this.fromDate) {
      this.minToDate = new Date(this.fromDate);
    } else {
      this.minToDate = null;
    }
  }

  transformCategoryName(categoryName: string): string {
    return "REPORTS.CATEGORIES." + (categoryName ? categoryName.toUpperCase().replace(/\s+/g, "_") : "UNKNOWN");
  }
}
