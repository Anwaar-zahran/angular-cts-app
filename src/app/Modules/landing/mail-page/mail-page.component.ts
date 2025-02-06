import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MailDetailsDialogComponent } from '../mail-details-dialog/mail-details-dialog.component';
import { VisualTrackingComponent } from '../../shared/visual-tracking/visual-tracking.component';
import { environment } from '../../../../environments/environment';
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
  selector: 'app-mail-page',
  templateUrl: './mail-page.component.html',
  styleUrl: './mail-page.component.scss',
  standalone: false
})

export class MailPageComponent implements OnInit {
  accessToken: string | null;
  structureId: any; // Declare at class level
  //
  dtOptions: DataTables.Settings = {};
  newItems: any[] = [];
  sentItems: any[] = [];
  completedItems: any[] = [];

  loading: boolean = true; // Loading state

  constructor(private http: HttpClient, private router: Router, private dialog: MatDialog) {
    this.accessToken = localStorage.getItem('access_token');
  }

  ngOnInit() {
    this.initDtOptions();

    // try {
    // // const decodedToken: any = jwtDecode(this.accessToken);
    // //const payload =this.accessToken.split('.')[1]; // Get the payload (2nd part)
    //   //this.structureId = decodedToken.structureId; // Adjust the property name as per your token's payload
    //   console.log('Structure ID:', this.structureId);
    // } catch (error) {
    //   console.error('Token decoding failed:', error);
    // }
    this.fetchData(); // Call the fetchData method
  }

  initDtOptions() {
    this.dtOptions = {
      pageLength: 10,
      search: false,
      order: [],
      pagingType: 'full_numbers',
      paging: true,
      searching: false,
      displayStart: 0,
      // search:{search:""},
      autoWidth: false,
      // ordering: true,
      language: {
        paginate: {
          first: "<i class='text-secondary fa fa-angle-left'></i>",
          previous: "<i class='text-secondary fa fa-angle-double-left'></i>",
          next: "<i class='text-secondary fa fa-angle-double-right'></i>",
          last: "<i class='text-secondary fa fa-angle-right'></i>",
        },
        // info: "Showing page _PAGE_ of _TOTAL_",
      },
      dom: "tp",
      //dom: "tpif",  // Add 'i' to show info
      ordering: false
    };
  }
  initDtOptions1() {
    this.dtOptions = {
      pageLength: 10,
      search: false,
      order: [],
      pagingType: 'full_numbers',
      paging: true,
      searching: false,
      displayStart: 0,
      // search:{search:""},
      autoWidth: false,
      // ordering: true,
      language: {
        paginate: {
          first: "<i class='text-secondary fa fa-angle-left'></i>",
          previous: "<i class='text-secondary fa fa-angle-double-left'></i>",
          next: "<i class='text-secondary fa fa-angle-double-right'></i>",
          last: "<i class='text-secondary fa fa-angle-right'></i>",
        },
      },
      dom: "tp",
      ordering: false
    };
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
  fetchData() {
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
    formData.append('PurposeId', '8');
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
        this.sentItems = sentResponse.data.map((item: ApiResponseItem) => ({
          subject: item.subject,
          details: `Transferred from: ${item.fromUser}`,
          date: item.transferDate,
          ref: item.referenceNumber,
          isRead: item.isRead,
          isOverDue: item.isOverDue,
          id: item.id,
          documentId: item.documentId,
          row: item
        })) || [];
        this.completedItems = completedResponse.data.map((item: ApiResponseItem) => ({
          subject: item.subject,
          details: `Transferred from: ${item.fromUser}`,
          date: item.transferDate,
          ref: item.referenceNumber,
          isRead: item.isRead,
          isOverDue: item.isOverDue,
          id: item.id,
          documentId: item.documentId,
          row: item
        })) || [];
        this.newItems = inboxResponse.data.map((item: ApiResponseItem) => ({
          subject: item.subject,
          details: `Transferred from: ${item.fromUser}`,
          date: item.transferDate,
          ref: item.referenceNumber,
          isRead: item.isRead,
          isOverDue: item.isOverDue,
          id: item.id,
          documentId: item.documentId,
          row: item
        })) || [];
        console.log('newItems:', this.newItems);
        console.log('Completed:', this.completedItems);
        console.log('sentItems:', this.sentItems);
        // Return a value (could be an object or array, or simply `null`)
        // return [sentResponse, completedResponse, inboxResponse];
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      }).finally(() => {
        this.loading = false; // Set loading to false after data fetch
      });;

  }
  active = 1;


  showMailDetails(item: ApiResponseItem) {
    debugger;
    this.dialog.open(MailDetailsDialogComponent, {
      disableClose: true,
      width: '90%',
      height: '90%',
      data: {
        id: item.row.documentId,
        documentId: item.documentId,
        referenceNumber: item.ref,
        row: item.row,
        fromSearch: false
      }
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
}

