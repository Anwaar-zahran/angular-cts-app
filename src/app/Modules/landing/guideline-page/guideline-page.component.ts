import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { VisualTrackingComponent } from '../../shared/visual-tracking/visual-tracking.component';
import { MailDetailsDialogComponent } from '../mail-details-dialog/mail-details-dialog.component';
import { AuthService } from '../../auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { MailsService } from '../../../services/mail.service';
import { DataTableDirective } from 'angular-datatables';
import { ApiResponseItem } from '../../../models/ApiResponseItem.model';
import { PopUpComponent } from '../../shared/pop-up/pop-up.component';

@Component({
  selector: 'app-guideline-page',
  templateUrl: './guideline-page.component.html',
  styleUrl: './guideline-page.component.scss',
  standalone: false
})
export class GuidelinePageComponent implements OnInit,OnDestroy {
  accessToken: string | null;
  structureId: any; // Declare at class level
  //
  dtOptions: any = {};
  newItems: any[] = [];
  sentItems: any[] = [];
  completedItems: any[] = [];

  loading: boolean = true;
  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  totalItems: number = 0;
  startIndex: number = 0;
  endIndex: number = 0;
  pages: number[] = [];
  purposeId: string = "9";
  activeTab: 'new' | 'sent' | 'completed' = 'new';
  itemsPerPage: number = this.dtOptions.pageLength || 10;
  currentPageMap = {
    new: 1,
    sent: 1,
    completed: 1
  };
  nodeIdInbox='2';
  nodeIdSent='6';
  nodeIdComplete='3';
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  newGuidelineCount!: number


  isDtInitialized: boolean = false;
  constructor(
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService,
    private translate: TranslateService,
    private mailService: MailsService,
  ) {
    this.accessToken = localStorage.getItem('access_token');
  }
  ngOnDestroy(): void {
    localStorage.removeItem('current_Tab');
  }

  ngOnInit() {
    this.initDtOptions();
    this.loadInboxData();
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
            first: "<i class='text-secondary fa fa-angle-double-left'></i>",
            previous: "<i class='text-secondary fa fa-angle-left'></i>",
            next: "<i class='text-secondary fa fa-angle-right'></i>",
            last: "<i class='text-secondary fa fa-angle-double-right'></i>",
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
  active = 1;
  showMailDetails(item: ApiResponseItem, showActionbtns: boolean) {
     
    const currentName = this.authService.getDisplayName();

    if(this.activeTab.toLocaleLowerCase() =="new"){
    // Mark correspondence as read
    this.mailService.markCorrespondanceAsRead(this.accessToken!, item.id).subscribe({
      next: () => {
        if(!item.row.isRead){
          console.log('Marked as read');
          item.row.isRead = true;
          this.mailService.fetchNotificationCounts();
        }
      },
      error: (err) => console.error('Error marking as read:', err)
    });
  }
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
        fromSearch: false,
        showActionButtons: (showActionbtns && (!item.row?.isLocked || (item.row?.isLocked && item.row?.lockedBy == currentName)) && item.row.purposeId != 10)
      }
    });

    // Refresh the item when dialog closes
    dialogRef.afterClosed().subscribe(result => {
      console.log('Mail details closed', result);
      this.setActiveTab(this.activeTab); // Call API again to refresh only the necessary data
    });
  }
  showVisualTracking(item: ApiResponseItem) {
    console.log(item)
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

    const table = $(activeTab).find('table').DataTable();

    let columnIndex = 0;
    if (criteria === 'date') {
      columnIndex = 1;
    } else if (criteria === 'ref') {
      columnIndex = 2;
    }
    const currentOrder = table.order();
    const currentSortOrder = currentOrder.length && currentOrder[0][1];

    const newSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    table.order([columnIndex, newSortOrder]).draw();
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
    if ((page === 1 && this.currentPage === 1) || (page === this.totalPages && this.currentPage === this.totalPages)) {
      return;
    }
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
    console.log(this.activeTab)
    localStorage.setItem('current_Tab', this.activeTab)

    this.mailService.fetchData('/Transfer/ListInbox', this.structureId, page, this.itemsPerPage, this.accessToken!, this.nodeIdInbox,this.purposeId)
      .subscribe(
        (response) => {
          this.newItems = response.data.map(this.mapApiResponse.bind(this)) || [];
          // this.totalPages = Math.ceil(response.recordsTotal / this.itemsPerPage);
          this.totalItems = response.recordsTotal;
          console.log(this.totalItems)
          this.calculatePagination()
        },
        (error) => console.error('Error fetching inbox:', error),
        () => (this.loading = false)
      );
  }
  loadSentData(page: number = 1) {

    this.activeTab = 'sent';
    this.currentPage = page;
    // if (this.sentItems.length > 0) return; // Prevent duplicate calls
    this.loading = true;
    this.structureId = this.getStructureId();
    console.log(this.activeTab)
    localStorage.setItem('current_Tab', this.activeTab)

    this.mailService.fetchData('/Transfer/ListSent', this.structureId, page, this.itemsPerPage, this.accessToken!, this.nodeIdSent,this.purposeId)
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
    this.structureId = this.getStructureId();
    console.log(this.activeTab)
    localStorage.setItem('current_Tab', this.activeTab)

    this.mailService.fetchData('/Transfer/ListCompleted', this.structureId, page, this.itemsPerPage, this.accessToken!, this.nodeIdComplete,this.purposeId)
      .subscribe(
        (response) => {
          this.completedItems = response.data.map(this.mapApiResponse.bind(this)) || [];
          this.totalItems = response.recordsTotal;
          this.calculatePagination();
        },
        (error) => console.error('Error fetching completed mails:', error),
        () => (this.loading = false)
      );
  }

    openInstructionPopup(instruction: string, event?: Event): void {
      if (event) {
        event.preventDefault();
      }
  
      try {
        const dialogConfig: MatDialogConfig = {
          data: { 
            message: instruction,
            title: 'Full Instructions', 
            type: 'info' 
          },
          width: '400px',
        };
  
        this.dialog.open(PopUpComponent, dialogConfig);
      } catch (error) {
        console.error('Error opening popup:', error);
      }
    }
}

