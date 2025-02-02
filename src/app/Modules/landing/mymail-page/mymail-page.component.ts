import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MailDetailsDialogComponent } from '../mail-details-dialog/mail-details-dialog.component';

interface ApiResponseItem {
  id: string;
  documentId: string;
  subject: string;
  details: string;
  date: string;
  ref: string;
  isRead: boolean;
  isOverDue: boolean;
  fromUser: string;
  transferDate: string;
  referenceNumber: string;
  row: any;
}

@Component({
  selector: 'app-mymail-page',
  templateUrl: './mymail-page.component.html',
  styleUrls: ['./mymail-page.component.scss']
})
export class MymailPageComponent implements OnInit {
  accessToken: string | null;
  newItems: ApiResponseItem[] = [];
  loading: boolean = true;
  dtOptions: DataTables.Settings = {};
  structureId!: string;

  constructor(private http: HttpClient, private router: Router, private dialog: MatDialog) {
    this.accessToken = localStorage.getItem('access_token');
    if (!this.accessToken) {
      console.error('Access token not found');
      return;
    }
  }

  ngOnInit() {
    this.initDtOptions();
    this.fetchInboxData();
  }

  initDtOptions() {
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
        }
      },
      dom: "tp",
      ordering: false
    };
  }

  private base64UrlDecode(str: string): string {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (str.length % 4) {
      case 2: str += '=='; break;
      case 3: str += '='; break;
    }
    return decodeURIComponent(escape(window.atob(str)));
  }

  fetchInboxData() {
    if (!this.accessToken) {
      console.error('Access token not found');
      this.router.navigate(['/login']);
      return;
    }

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

    this.http.post<any>('https://cts-qatar.d-intalio.com/Transfer/ListInbox', formData, { headers })
      .subscribe({
        next: (response) => {
          this.newItems = response.data.map((item: ApiResponseItem) => ({
            subject: item.subject,
            details: `Transferred from: ${item.fromUser}`,
            date: item.transferDate,
            ref: item.referenceNumber,
            isRead: item.isRead,
            isOverDue: item.isOverDue,
            id: item.id,
            row: item
          }));
          console.log('Inbox items:', this.newItems);
        },
        error: (error) => {
          console.error('Error fetching inbox data:', error);
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  showMailDetails(item: ApiResponseItem) {
    debugger;
    this.dialog.open(MailDetailsDialogComponent, {
      disableClose: true,
      width: '90%',
      height: '90%',
      data: {
        id: item.id,
        documentId: item.documentId,
        referenceNumber: item.ref,
        row: item.row
      }
    });
  }
}
