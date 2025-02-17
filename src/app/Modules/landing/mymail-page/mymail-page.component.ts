import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { VisualTrackingComponent } from '../../shared/visual-tracking/visual-tracking.component';
import { MailDetailsDialogComponent } from '../mail-details-dialog/mail-details-dialog.component';
import { AuthService } from '../../auth/auth.service';
import { TranslateService } from '@ngx-translate/core';

interface ApiResponseItem {
  id: number;
  documentId: number;
  ref: string;
  categoryId: number;
  referenceNumber: string;
  transferDate: string;
  status: number;
  fromUser: string;
  subject: string;
  isRead: boolean;
  isOverDue: boolean;
  row: any;
}

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

  loading: boolean = true; // Loading state

  constructor(
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService,
    private translate: TranslateService
  ) {
    this.accessToken = localStorage.getItem('access_token');
  }

  ngOnInit() {
    this.initDtOptions();
    this.loadData();
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
        }, 50);
      });
    });
  }
  private initDtOptions() {
    this.translate.get('COMMON.DATATABLE').subscribe(translations => {
      this.dtOptions = {
        pageLength: 10,
        pagingType: 'full_numbers',
        paging: true,
        searching: false,
        autoWidth: false,
        language: {
          paginate: {
            first: "<i class='text-secondary fa fa-angle-left'></i>",
            previous: "<i class='text-secondary fa fa-angle-double-left'></i>",
            next: "<i class='text-secondary fa fa-angle-double-right'></i>",
            last: "<i class='text-secondary fa fa-angle-right'></i>",
          },
        },
        dom: 'tp',
        drawCallback: (settings: any) => {
          const api = settings.oInstance.api();
          const pageInfo = api.page.info();
          const pagination = $(api.table().container()).find('.dataTables_paginate');
          pagination.find('input.paginate-input').remove();
          const page = $('<span class="d-inline-flex align-items-center mx-2">Page <input type="number" class="paginate-input form-control form-control-sm mx-2" min="1" max="' + pageInfo.pages + '" value="' + (pageInfo.page + 1) + '"> of ' + pageInfo.pages + '</span>');
            
          
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

  loadData() {
    if (!this.accessToken) {
      console.error('Access token not found');

      this.router.navigate(['/login']);
      return;
    }
    debugger
    const payload = this.accessToken.split('.')[1];
    const decodedPayload = this.base64UrlDecode(payload);
    const parsedPayload = JSON.parse(decodedPayload);
    this.structureId = localStorage.getItem('structureId') || parsedPayload.StructureId;
    console.log('Structure ID:', this.structureId);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`,
    });


    const formData = new FormData();
    formData.append('length', '1000');
    formData.append('structureId', this.structureId);
    // formData.append('NodeId', '34');


    const callApi = (url: string) => {
      return this.http.post<any>(url, formData, { headers }).toPromise();
    };
    // Fetch all data concurrently
    Promise.all([
      callApi(`${environment.apiBaseUrl}/Transfer/ListSent`),
      callApi(`${environment.apiBaseUrl}/Transfer/ListCompleted`),
      callApi(`${environment.apiBaseUrl}/Transfer/ListInbox`)
    ])
      .then(([sentResponse, completedResponse, inboxResponse]) => {
        console.log('Sent Response:', sentResponse);
        console.log('Completed Response:', completedResponse);
        console.log('Inbox Response:', inboxResponse);
        // Map the API data to respective items
        this.sentItems = sentResponse.data.map(this.mapApiResponse.bind(this)) || [];
        this.completedItems = completedResponse.data.map(this.mapApiResponse.bind(this)) || [];
        this.newItems = inboxResponse.data.map(this.mapApiResponse.bind(this)) || [];
        console.log('newItems:', this.newItems);
        console.log('Completed:', this.completedItems);
        console.log('sentItems:', this.sentItems);

      })
      .catch(error => {
        console.error('Error fetching data:', error);
      }).finally(() => {
        this.loading = false;
      });;

  }
  active = 1;
  fromSent: boolean = false;
  fromCompleted: boolean = false;

  showMailDetails(item: ApiResponseItem, showActionbtns: boolean) {
    const currentName = this.authService.getDisplayName();
    debugger;
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
        showActionButtons: (showActionbtns && (!item.row?.isLocked || (item.row?.isLocked && item.row?.lockedBy == currentName)))

      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Mail details closed', result);
    //  window.location.reload();
      //this.fetchData();
      //this.router.navigate([this.router.url]);
    });
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
  sortBy(criteria: string) {
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
  
compare(a: any, b: any, criteria: string): number {
  if (criteria === 'date') {
      return new Date(a?.date || 0).getTime() - new Date(b?.date || 0).getTime();
  }
  if (criteria === 'ref') {
      return (a?.ref || '').localeCompare(b?.ref || '');
  }
  return 0;
}

}
