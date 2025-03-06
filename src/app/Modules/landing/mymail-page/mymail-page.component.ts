import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { VisualTrackingComponent } from '../../shared/visual-tracking/visual-tracking.component';
import { MailDetailsDialogComponent } from '../mail-details-dialog/mail-details-dialog.component';
import { AuthService } from '../../auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { MailsService } from '../../../services/mail.service';
import { DataTableDirective } from 'angular-datatables';
import { ApiResponseItem } from '../../../models/ApiResponseItem.model';

@Component({
  selector: 'app-mymail-page',
  templateUrl: './mymail-page.component.html',
  styleUrls: ['./mymail-page.component.scss'],
  standalone: false
})
export class MymailPageComponent implements OnInit {
  accessToken: string | null;
  structureId: any; // Declare at class level
  //
  dtOptions: any = {};
  newItems: any[] = [];
  sentItems: any[] = [];
  completedItems: any[] = [];
  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  totalItems: number = 0;
  startIndex: number = 0;
  endIndex: number = 0;
  pages: number[] = [];
  loading: boolean = true; // Loading state
  activeTab: 'new' | 'sent' | 'completed' = 'new';
  itemsPerPage: number = this.dtOptions.pageLength || 10;
  currentPageMap = {
    new: 1,
    sent: 1,
    completed: 1
  };
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  isDtInitialized: boolean = false;
  constructor(
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService,
    private translate: TranslateService,
    private mailService: MailsService,
    private cdr: ChangeDetectorRef
  ) {
    this.accessToken = localStorage.getItem('access_token');
  }

  ngOnInit() {
    this.initDtOptions();
    this.loadInboxData();
  }
  ngAfterViewInit() {
    /*reset pagination*/
    const tabTriggers = document.querySelectorAll('[data-bs-toggle="tab"]');
    tabTriggers.forEach(tab => {
      tab.addEventListener('shown.bs.tab', () => {
        setTimeout(() => {
          const activePane = document.querySelector('.tab-pane.active');
          if (activePane) {
            const table = activePane.querySelector('table');
            if (table) {
              const dt = $(table).DataTable();
              dt.page(0).draw('page');
            }
          }
          this.cdr.detectChanges();
        }, 50);
      });
    });
  }
  calculatePagination() {
    this.totalPages = Math.ceil(this.totalItems / this.dtOptions.pageLength);
    this.startIndex = (this.currentPage - 1) * this.dtOptions.pageLength + 1;
    this.endIndex = Math.min(this.startIndex + this.dtOptions.pageLength - 1, this.totalItems);

    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
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
        ordering: true
      };
    });
  }
  base64UrlDecode(str: string): string {
    // Replace non-URL safe characters and pad with `=`
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (str.length % 4) {
      case 2: str += '=='; break;
      case 3: str += '='; break;
    }
    return decodeURIComponent(escape(window.atob(str))); // Decode base64
  }

  private mapApiResponse(item: ApiResponseItem) {
    return {
      subject: item.subject,
      details: this.translate.instant('MYMAIL.DETAILS.TRANSFERRED_FROM', { user: item.fromUser }),
      date: item.transferDate,
      ref: item.referenceNumber,
      isRead: item.isRead,
      isOverDue: item.isOverDue,
      id: item.id,
      documentId: item.documentId,
      row: item
    };
  }
  previousPage() {
    if (this.currentPageMap[this.activeTab] > 1) {
      this.goToPage(this.currentPageMap[this.activeTab] - 1);
    }
  }

  nextPage() {
    if (this.currentPageMap[this.activeTab] < this.totalPages) {
      this.goToPage(this.currentPageMap[this.activeTab] + 1);
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPageMap[this.activeTab] = page;
      this.setActiveTab(this.activeTab);
    }
  }

  setActiveTab(tab: 'new' | 'sent' | 'completed',) {
    if (this.activeTab !== tab) {
      // Reset pagination ONLY when switching tabs
      this.currentPageMap[tab] = 1;
    }
    this.activeTab = tab;
    const currentPageforTab = this.currentPageMap[this.activeTab];
    if (tab === 'new') {
      this.loadInboxData(currentPageforTab);
    } else if (tab === 'sent') {
      this.loadSentData(currentPageforTab);
    } else {
      this.loadCompletedData(currentPageforTab);
    }
  }
  active = 1;
  fromSent: boolean = false;
  fromCompleted: boolean = false;

  showMailDetails(item: ApiResponseItem, showActionbtns: boolean) {
    debugger;
    const currentName = this.authService.getDisplayName();

    // Mark correspondence as read
    this.mailService.markCorrespondanceAsRead(this.accessToken!, item.id).subscribe({
      next: () => {
        console.log('Marked as read');
        item.row.isRead = true; // Update item locally to reflect the change
      },
      error: (err) => console.error('Error marking as read:', err)
    });

    // Open the dialog
    const dialogRef = this.dialog.open(MailDetailsDialogComponent, {
      disableClose: true,
      width: '90%',
      height: '90%',
      data: {
        id: item.row.documentId,
        documentId: item.documentId,
        referenceNumber: item.ref,
        row: item.row,
        fromSearch: true,
        showActionButtons: (showActionbtns && (!item.row?.isLocked || (item.row?.isLocked && item.row?.lockedBy == currentName)) && item.row.purposeId != 10)
      }
    });

    // Refresh the item when dialog closes
    dialogRef.afterClosed().subscribe(result => {
      console.log('Mail details closed', result);

      // if (result === 'updated') { 
      this.setActiveTab(this.activeTab); // Call API again to refresh only the necessary data
      //}

    });
  }
  private getStructureId(): string {
    const payload = this.accessToken?.split('.')[1] || '';
    const decodedPayload = this.base64UrlDecode(payload);
    const parsedPayload = JSON.parse(decodedPayload);
    return localStorage.getItem('structureId') || parsedPayload.StructureId;
  }
  loadInboxData(page: number = 1) {
    this.activeTab = "new";
    this.loading = true;
    this.currentPage = page
    this.structureId = this.getStructureId();

    this.mailService.fetchData('/Transfer/ListInbox', this.structureId, page, this.itemsPerPage, this.accessToken!)
      .subscribe(
        (response) => {
          this.newItems = response.data.map(this.mapApiResponse.bind(this)) || [];
          // this.totalPages = Math.ceil(response.recordsTotal / this.itemsPerPage);
          this.totalItems = response.recordsTotal;
          this.calculatePagination()
        },
        (error) => console.error('Error fetching inbox:', error),
        () => (this.loading = false)
      );
  }
  loadSentData(page: number = 1) {

    debugger;
    this.activeTab = 'sent';
    this.currentPage = page;
    this.fromSent = true;
    // if (this.sentItems.length > 0) return; // Prevent duplicate calls
    this.loading = true;
    this.structureId = this.getStructureId();

    this.mailService.fetchData('/Transfer/ListSent', this.structureId, page, this.itemsPerPage, this.accessToken!)
      .subscribe(
        (response) => {
          this.sentItems = response.data.map(this.mapApiResponse.bind(this)) || [];
          this.totalItems = response.recordsTotal;
          this.calculatePagination();
        },
        (error) => console.error('Error fetching sent mails:', error),
        () => (this.loading = false)
      );
  }

  loadCompletedData(page: number = 1) {
    this.activeTab = 'completed';
    // if (this.completedItems.length > 0) return; // Prevent duplicate calls
    this.loading = true;
    this.currentPage = page;
    this.fromCompleted = true;
    this.structureId = this.getStructureId();

    this.mailService.fetchData('/Transfer/ListCompleted', this.structureId, page, this.itemsPerPage, this.accessToken!)
      .subscribe(
        (response) => {
          this.completedItems = response.data.map(this.mapApiResponse.bind(this)) || [];
          this.totalItems = response.recordsTotal;
          this.calculatePagination();

          setTimeout(() => {
            this.initializeDataTable('#completed-tab table');
          }, 0);
        },
        (error) => console.error('Error fetching completed mails:', error),
        () => (this.loading = false)
      );
  }

  showVisualTracking(item: ApiResponseItem) {
    this.dialog.open(VisualTrackingComponent, {
      width: '90%',
      height: '90%',
      data: {
        documentId: item.documentId,
        referenceNumber: item.ref
      }
    });
  }

  sortOrder: { [key: string]: 'asc' | 'desc' } = { date: 'asc', ref: 'asc' };

  sortByRef(criteria: string) {

    const activeTab = document.querySelector('.nav-link.active')?.getAttribute('data-bs-target');

    if (!activeTab) {
      return;
    }
    const tableElement = document.querySelector(`${activeTab} table`);
    if (!tableElement) {
      console.error("Table not found in active tab");
      return;
    }

    let table;
    try {
      table = $(tableElement).DataTable();
    } catch (e) {
      console.error("Error accessing DataTable:", e);
      return;
    }

    let columnIndex = 0;
    if (criteria === 'date') {
      columnIndex = 1;
    } else if (criteria === 'ref') {
      columnIndex = 2;
    }

    this.sortOrder[criteria] = this.sortOrder[criteria] === 'asc' ? 'desc' : 'asc';

    table.order([columnIndex, this.sortOrder[criteria]]).draw();
  }

  sortByTransfer(criteria: string) {
    this.sortOrder[criteria] = this.sortOrder[criteria] === 'asc' ? 'desc' : 'asc';
    const direction = this.sortOrder[criteria];

    const activeTab = document.querySelector('.nav-link.active')?.getAttribute('data-bs-target');
    if (!activeTab) return;

    let dataArray: any[] = [];
    if (activeTab === '#nav-new') {
      dataArray = this.newItems;
    } else if (activeTab === '#nav-sent') {
      dataArray = this.sentItems;
    } else if (activeTab === '#nav-completed') {
      dataArray = this.completedItems;
    }

    if (criteria === 'date') {
      dataArray.sort((a, b) => {
        const partsA = a.date.split('/');
        const partsB = b.date.split('/');

        const dateA = new Date(
          parseInt(partsA[2]),
          parseInt(partsA[1]) - 1,
          parseInt(partsA[0])
        );

        const dateB = new Date(
          parseInt(partsB[2]),
          parseInt(partsB[1]) - 1,
          parseInt(partsB[0])
        );

        return direction === 'asc' ?
          dateA.getTime() - dateB.getTime() :
          dateB.getTime() - dateA.getTime();
      });
    } else if (criteria === 'ref') {
      dataArray.sort((a, b) => {
        return direction === 'asc' ?
          a.ref.localeCompare(b.ref) :
          b.ref.localeCompare(a.ref);
      });
    }
    this.cdr.detectChanges();
  }

  compare(a: any, b: any, criteria: string): number {
    if (criteria === 'date') {
      return new Date(a?.date || 0).getTime() - new Date(b?.date || 0).getTime();
    }
    if (criteria === 'ref') {
      return (a?.ref || '').localeCompare(b?.ref || '');
    }
    return 0;
  }

  trackByFn(index: number, item: any): number {
    return item.id;
  }

  initializeDataTable(selector: string) {
    // Destroy existing table if it exists
    const existingTable = $(selector).DataTable();
    if (existingTable) {
      existingTable.destroy();
    }

    // Initialize with your options
    $(selector).DataTable({
      paging: false, // Since you're handling pagination yourself
      searching: false, // If you don't need search
      info: false, // Hide "Showing X of Y entries"
      ordering: true, // Enable sorting
      order: [] // Default ordering, empty for none
    });
  }

}
