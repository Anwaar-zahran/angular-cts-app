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

  private initDtOptions() {
    this.translate.get('COMMON.DATATABLE').subscribe(translations => {
      this.dtOptions = {
        pageLength: 10,
        search: false,
        order: [],
        pagingType: 'full_numbers',
        paging: true,
        searching: false,
        displayStart: 0,
        autoWidth: false,
        language: {
          search: "",
          info: "",
          paginate: {
            first: "<i class='text-secondary fa fa-angle-left'></i>",
            previous: "<i class='text-secondary fa fa-angle-double-left'></i>",
            next: "<i class='text-secondary fa fa-angle-double-right'></i>",
            last: "<i class='text-secondary fa fa-angle-right'></i>",
          },
          emptyTable: ""
        },
        dom: "tp",
        ordering: false
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
    this.structureId = parsedPayload.StructureId;
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
        debugger
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
      window.location.reload();
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
  sortBy2(criteria: string) {
    if (this.sortOrder[criteria] === 'asc') {
        this.newItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        this.sortOrder[criteria] = 'desc'; // Next click will be descending
    } else {
        this.newItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.sortOrder[criteria] = 'asc'; // Next click will be ascending
    }
  }
  sortBy1(criteria: string) {
    debugger
    let activeTab = document.querySelector('.nav-link.active')?.getAttribute('data-bs-target');

    switch (activeTab) {
        case '#nav-new':
          debugger
            //this.newItems.sort((a, b) => this.compare(a, b, criteria));
            if(criteria ==="date"){
              this.newItems.sort((a, b) => {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            });
            }
            break;
        case '#nav-sent':
            this.sentItems.sort((a, b) => this.compare(a, b, criteria));
            break;
        case '#nav-completed':
            this.completedItems.sort((a, b) => this.compare(a, b, criteria));
            break;
    }
}


sortBy(criteria: string) {
    let activeTab = document.querySelector('.nav-link.active')?.getAttribute('data-bs-target');
    let dataArray: any[] = [];

    switch (activeTab) {
        case '#nav-new':
            dataArray = this.newItems;
            break;
        case '#nav-sent':
            dataArray = this.sentItems;
            break;
        case '#nav-completed':
            dataArray = this.completedItems;
            break;
        default:
            return; // If no valid tab, exit function
    }

    if (!dataArray || dataArray.length === 0) return;

    // Toggle sorting order
    if (this.sortOrder[criteria] === 'asc') {
        dataArray.sort((a, b) => {
            if (criteria === 'date') {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            } else if (criteria === 'ref') {
                return (a?.ref || '').localeCompare(b?.ref || '');
            }
            return 0;
        });
        this.sortOrder[criteria] = 'desc';
    } else {
        dataArray.sort((a, b) => {
            if (criteria === 'date') {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            } else if (criteria === 'ref') {
                return (b?.ref || '').localeCompare(a?.ref || '');
            }
            return 0;
        });
        this.sortOrder[criteria] = 'asc';
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

}
