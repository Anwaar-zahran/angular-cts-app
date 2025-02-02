import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SearchFilter } from '../../app/models/searchFilter.model';
import { AttachmentsApiResponce } from '../models/attachments.model';

@Injectable({
  providedIn: 'root'
})
export class SearchPageService {
  private searchApiUrl = 'https://cts-qatar.d-intalio.com/Search/List';
  private getDocDetails = 'https://cts-qatar.d-intalio.com/Document/GetSearchDocument';
  private notesURL = 'https://cts-qatar.d-intalio.com/Note/List';
  private linkedDocURL = 'https://cts-qatar.d-intalio.com/LinkedDocument/List';
  private nonArchiveURL = 'https://cts-qatar.d-intalio.com/NonArchivedAttachments/List'
  private transHistoryURL = 'https://cts-qatar.d-intalio.com/Transfer/ListTransferHistory'
  private activityLogURL = 'https://cts-qatar.d-intalio.com/ActivityLog/ListByDocumentId'
  private attachmentsURL = 'https://cts-qatar.d-intalio.com/Attachment/List'
  private visualTrackingURL = 'https://cts-qatar.d-intalio.com/Document/GetTrackingData'

  constructor(private httpClient: HttpClient) { }

  searchInbox(accessToken: string, searchModel: SearchFilter): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      // 'Content-Type': 'application/json', 
    });

    const payload = accessToken.split('.')[1]; // Get the payload (2nd part)
    const decodedPayload = this.base64UrlDecode(payload);
    const parsedPayload = JSON.parse(decodedPayload);
    const structureId = parsedPayload.StructureId; // Adjust based on your token's payload
    const draw = 0;
    const start = 0;
    const length = 10;

    const body = new URLSearchParams();
    body.set('draw', draw.toString());
    body.set('start', start.toString());
    body.set('length', length.toString());

    searchModel.structureId = structureId;

    body.set('Model', JSON.stringify(searchModel));

    return this.httpClient.post(this.searchApiUrl, body.toString(), { headers })
      .pipe(
        catchError((error) => {
          console.error('Error while searching data', error.message);
          throw error;
        })
      );
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

  getActivityLog(accessToken: string, id: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });

    const start = 0;
    const length = 10;

    const params = new URLSearchParams();
    params.set('id', id);
    params.set('start', start.toString());
    params.set('length', length.toString());

    const urlWithParams = `${this.activityLogURL}?${params.toString()}`;

    return this.httpClient.get(urlWithParams, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching activity log', error.message);
          throw error;
        })
      );
  }

  getNonArchivedAttachment(accessToken: string, id: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });

    const draw = 0;
    const length = 10;

    const params = new URLSearchParams();
    params.set('documentId', id);
    params.set('draw', draw.toString());
    params.set('length', length.toString());

    const urlWithParams = `${this.nonArchiveURL}?${params.toString()}`;

    return this.httpClient.get(urlWithParams, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching activity log', error.message);
          throw error;
        })
      );
  }

  getLinkedCorrespondence(accessToken: string, id: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });

    const params = new URLSearchParams();
    params.set('documentId', id);

    const urlWithParams = `${this.linkedDocURL}?${params.toString()}`;

    return this.httpClient.get(urlWithParams, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching activity log', error.message);
          throw error;
        })
      );
  }

  getNotes(accessToken: string, id: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });

    const draw = 0;
    const length = 10;
    const start = 0;

    const params = new URLSearchParams();
    params.set('draw', draw.toString());
    params.set('start', start.toString());
    params.set('length', length.toString());
    params.set('documentId', id);

    const urlWithParams = `${this.notesURL}?${params.toString()}`;

    return this.httpClient.get(urlWithParams, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching activity log', error.message);
          throw error;
        })
      );
  }

  getDocAttributes(accessToken: string, id: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });

    const params = new URLSearchParams();
    params.set('id', id);

    const urlWithParams = `${this.getDocDetails}?${params.toString()}`;

    return this.httpClient.get(urlWithParams, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching attributes', error.message);
          throw error;
        })
      );
  }

  getTransHistory(accessToken: string, id: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
    });

    const formData = new FormData();
    formData.append('draw', JSON.stringify(0));
    formData.append('start', JSON.stringify(0));
    formData.append('length', JSON.stringify(10));
    formData.append('documentId', JSON.stringify(id));

    return this.httpClient.post(this.transHistoryURL, formData, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching attributes', error.message);
          throw error;
        })
      );
  }

  getAttachments(accessToken: string, id: string): Observable<AttachmentsApiResponce[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });

    const params = new HttpParams().set('documentId', id);

    return this.httpClient.get<AttachmentsApiResponce[]>(this.attachmentsURL, { headers, params })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching attachments:', error.message);
          return [];
        })
      );
  }

  getVisualTracking(documentId: string): Observable<any> {


    const params = new HttpParams().set('id', documentId);

    return this.httpClient.get(this.visualTrackingURL, { params })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching visual tracking:', error.message);
          return [];
        })
      );
  }
}


