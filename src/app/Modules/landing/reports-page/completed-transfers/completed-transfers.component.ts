import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ApiResponse } from '../../../../models/api-response.model';
import { InprogressReport } from '../../../../models/inprogress-report.model';
import { Structure } from '../../../../models/structure.model';
import { User } from '../../../../models/user.model';
import { ReportsService } from '../../../../services/reports.service';
import { StructuresService } from '../../../../services/structures.service';
import { UsersService } from '../../../../services/users.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-completed-transfers',
  templateUrl: './completed-transfers.component.html',
  styleUrls: ['./completed-transfers.component.css'],
  standalone: false
})
export class CompletedTransfersComponent implements OnInit {

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  isDtInitialized: boolean = false;
  rerender: Subject<any> = new Subject<any>();

  selectedStructures: number[] = [];
  structures: Structure[] = [];
  structureError: string = '';

  fromDate: Date | undefined;
  toDate: Date | undefined;

  selectedUsers: number[] = [];
  users: User[] = [];
  userError: string = '';

  isOverdue: boolean = false;

  reports: InprogressReport[] = [];

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

  constructor(
    private router: Router,
    private reportsService: ReportsService,
    private usersService: UsersService,
    private structuresService: StructuresService,
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
    this.initDtOptions();
    this.loadStructures();
    this.loadReports();
    this.loadUsers();
    //const today = new Date();
    // this.fromDate = {
    //   year: today.getFullYear(),
    //   month: today.getMonth() + 1,
    //   day: today.getDate()
    // };
    // this.toDate = {
    //   year: today.getFullYear(),
    //   month: today.getMonth() + 1,
    //   day: today.getDate()
    // };
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
            first: "<i class='text-secondary fa fa-angle-left'></i>",
            previous: "<i class='text-secondary fa fa-angle-double-left'></i>",
            next: "<i class='text-secondary fa fa-angle-double-right'></i>",
            last: "<i class='text-secondary fa fa-angle-right'></i>",
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

    console.log('Loading reports with params:', params);

    this.reportsService.listCompletedTransfers(params).subscribe({
      next: (response: ApiResponse<InprogressReport[]>) => {
        this.reports = response.data;
        this.totalItems = response.recordsTotal;
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
      error: (error) => {
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
    this.structureError = '';
    this.userError = '';

    this.currentPage = 1;

    console.log('Search Parameters:', {
      structures: this.selectedStructures,
      users: this.selectedUsers,
      fromDate: this.formatDate(this.fromDate),
      toDate: this.formatDate(this.toDate),
      isOverdue: this.isOverdue
    });

    this.loadReports();
  }

  clear() {
    this.selectedStructures = [];
    this.selectedUsers = [];
    this.structureError = '';
    this.userError = '';
    this.isOverdue = false;
    this.fromDate = undefined;
    this.toDate = undefined;
    // const today = new Date();
    // this.fromDate = {
    //   year: today.getFullYear(),
    //   month: today.getMonth() + 1,
    //   day: today.getDate()
    // };
    // this.toDate = {
    //   year: today.getFullYear(),
    //   month: today.getMonth() + 1,
    //   day: today.getDate()
    // };

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

}
