import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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
  selector: 'app-complete-correspondences',
  templateUrl: './complete-correspondences.component.html',
  styleUrls: ['./complete-correspondences.component.css'],
  standalone: false
})
export class CompleteCorrespondencesComponent implements OnInit {

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  isDtInitialized: boolean = false;
  rerender: Subject<any> = new Subject<any>();

  selectedStructures: number[] = [];
  structures: Structure[] = [];
  structureError: string = '';
  expandedRows: Set<any> = new Set();

  fromDate: Date | undefined;
  toDate: Date | undefined;
  minToDate: Date | null = null;

  selectedUsers: number[] = [];
  users: User[] = [];
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
  //selectedPriorityId: any = null;// | null = null;

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
      this.loadUsers(searchText);
    });

    // Add structure search debounce
    this.structureSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchText => {
      this.loadStructures(searchText);
    });
  }

  ngOnInit() {

    //this.selectedPrivacyId = null;
    //this.selectedPriorityId = null;

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

    this.reportsService.listCompletedCorrespondences(params).subscribe({
      next: (response: ApiResponse<InprogressCorrespondence[]>) => {
        this.reports = response.data;
        this.totalItems = response.recordsTotal;
        console.log(response.recordsTotal)
        this.calculatePagination();

        console.log('total reports')
        console.log(this.totalItems)

        console.log('------------------------------------------')
        console.log(this.reports)

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
  calculatePagination() {
    this.totalPages = Math.ceil(this.totalItems / this.dtOptions.pageLength);
    this.startIndex = (this.currentPage - 1) * this.dtOptions.pageLength + 1;
    this.endIndex = Math.min(this.startIndex + this.dtOptions.pageLength - 1, this.totalItems);

    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  loadStructures(searchText: string = '') {
    this.isLoadingStructures = true;
    this.structuresService.searchStructures(searchText).subscribe({
      next: (structures) => {
        this.structures = structures;
        this.isLoadingStructures = false;
      },
      error: (error) => {
        console.error('Error loading structures:', error);
        this.isLoadingStructures = false;
      }
    });
  }

  loadUsers(searchText: string = '') {
    this.usersService.searchUsers(searchText).subscribe({
      next: (users) => {
        this.users = users;
        this.isLoadingUsers = false;
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
        this.isLoadingUsers = false;
      }
    });
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
  
    // If the input is a string, try converting it to a Date
    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return ''; // Return empty if it's an invalid date
      }
      date = parsedDate;
    }
  
    // Ensure it's a valid Date object
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return ''; // Return empty for invalid date values
    }
  
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
    this.structureError = '';
    this.userError = '';

    this.currentPage = 1;

    console.log('Search Parameters:', {
      structures: this.selectedStructures,
      users: this.selectedUsers,
      privacy: this.selectedPrivacyId,
      priority: this.selectedPriorityId,
      fromDate: this.formatDate(this.fromDate),
      toDate: this.formatDate(this.toDate),
      isOverdue: this.isOverdue
    });

    const params: any = {
      page: this.currentPage,
      pageSize: this.dtOptions.pageLength,
      structureIds: this.selectedStructures,
      userIds: this.selectedUsers,
      fromDate: this.formatDate(this.fromDate),
      toDate: this.formatDate(this.toDate),
      isOverdue: this.isOverdue,
      privacyId: this.selectedPrivacyId ? this.selectedPrivacyId : null,
      priorityId: this.selectedPriorityId ? this.selectedPriorityId : null
    };

    this.reportsService.listCompletedCorrespondences(params).subscribe({
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
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadReports();
    }
  }

  onUserSearch(event: { term: string, items: User[] }) {
    this.userSearchText = event.term;
    this.isLoadingUsers = true;
    this.userSearchSubject.next(this.userSearchText);
  }

  getUserDisplayName(user: User): string {
    return user.fullName || `${user.firstName} ${user.lastName}`.trim();
  }

  onStructureSearch(event: { term: string, items: Structure[] }) {
    this.structureSearchText = event.term;
    this.isLoadingStructures = true;
    this.structureSearchSubject.next(this.structureSearchText);
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

  loadPrivacyOptions() {
    this.lookupsService.getPrivacy('').subscribe({
      next: (options) => {
        debugger;
        this.privacyOptions = options;
      },
      error: (error) => {
        console.error('Error loading privacy options:', error);
      }
    });
  }
  // To get lookup names based on language
  getName(item: any): string {

    const currentLang = this.translate.currentLang;
    switch (currentLang) {
      case 'ar':
        return item ?.nameAr || item ?.name;
      case 'fr':
        return item ?.nameFr || item ?.name;
      default:
        return item ?.name;
    }
  }

  loadPriorityOptions() {
    this.lookupsService.getPriorityOptions().subscribe({
      next: (options) => {
        this.priorityOptions = options;
      },
      error: (error) => {
        console.error('Error loading priority options:', error);
      }
    });
  }


  preventTyping(event: KeyboardEvent): void{
    if(!(event.ctrlKey && event.key === 'v') && !(['Backspace','Delete','ArrowLeft','ArrowRight','Tab']).includes(event.key)){
      event.preventDefault();
    }
  }

  onFromDateChange() {
    if (this.fromDate) {
      this.minToDate = new Date(this.fromDate);
    } else {
      this.minToDate = null;
    }
  }
}
