import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MailsService {
  private replyToURL = `${environment.apiBaseUrl}/Transfer/Reply`;
  private transferURL = `${environment.apiBaseUrl}/Transfer/Transfer`;
  private CorrsondanceViewURL = `${environment.apiBaseUrl}/Transfer/View`;
  private myTransferURL = `${environment.apiBaseUrl}/Transfer/GetTransferInfoById`;

  private mailCount = new BehaviorSubject<number>(0);
  private signatureCount = new BehaviorSubject<number>(0);
  private guidelineCount = new BehaviorSubject<number>(0);

  mailCount$ = this.mailCount.asObservable();
  signatureCount$ = this.signatureCount.asObservable();
  guidelineCount$ = this.guidelineCount.asObservable();
  constructor(private httpClient: HttpClient,) { }


  fetchNotificationCounts() {
    const structureId = localStorage.getItem('structureId') ?? " ";
    const token = localStorage.getItem('access_token') ?? "";
  
    const page = 1;
    const length = 1000;
    const fixedParam = '2';
  
    forkJoin({
      mail: this.fetchData('/Transfer/ListInbox', structureId, page, length, token, fixedParam),
      guideline: this.fetchData('/Transfer/ListInbox', structureId, page, length, token, fixedParam, '9'),
      signature: this.fetchData('/Transfer/ListInbox', structureId, page, length, token, fixedParam, '8')
    }).subscribe(({ mail, signature, guideline }) => {
      this.mailCount.next(mail.data.filter((x: any) => !x.isRead).length);
      this.signatureCount.next(signature.data.filter((x: any) => !x.isRead).length);
      this.guidelineCount.next(guideline.data.filter((x: any) => !x.isRead).length);
    });
  }
  

  
  transferMail(accessToken: string, model: any[]): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json', // Only one Content-Type header is needed
      'Accept': 'application/json'
    });

    let params = new HttpParams();
    params = params.set('maintainTransfer', 'false').set('withSign', 'false');

    const url = `${this.transferURL}?${params.toString()}`;

    // Ensure numbers are sent correctly
    const body = model.map(item => ({
      ...item,
      priorityId: Number(item.priorityId),
      purposeId: Number(item.purposeId),
      toUserId: item.toUserId ? Number(item.toUserId) : null,
      toStructureId: item.toStructureId ? Number(item.toStructureId) : null
    }));

    return this.httpClient.post(url, JSON.stringify(body), { headers }).pipe(
      catchError((error) => {
        console.error('Error while transferring mail', error.message);
        throw error;
      })
    );
  }

  replyToMail(accessToken: string, model: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json', // Only one Content-Type header is needed
    });


    //Transfer / Reply ? id = 80 & transferId=35 & purposeId=1 & dueDate & instruction & structureId & delegationId & structureReceivers[]=1 &
    //  transferToType=2 & withSign=false & SignatureTemplateId & documentId=80
    const params = new URLSearchParams();
    params.set('id', JSON.stringify(model.id));
    params.set('transferId', JSON.stringify(model.transferId));
    params.set('purposeId', JSON.stringify(model.purposeId));
    params.set('dueDate', JSON.stringify(model.dueDate));
    params.set('instruction', JSON.stringify(model.instruction));
    params.set('structureId', '');
    params.set('delegationId', '');
    params.set('structureReceivers[]', JSON.stringify(1));
    params.set('transferToType', JSON.stringify(2));
    params.set('withSign', 'false');
    params.set('SignatureTemplateId', '');
    params.set('documentId', JSON.stringify(model.documentId));

    const url = `${this.replyToURL}?${params.toString()}`;

    return this.httpClient.post(url, {}, { headers }).pipe(
      catchError((error) => {
        console.error('Error while reply to mail', error.message);
        throw error;
      })
    );
  }

  markCorrespondanceAsRead(accessToken: string, documentID: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json' // Only Accept header is needed, remove Content-Type
    });

    const formData = new FormData();
    formData.append('Id', documentID.toString()); // Ensure API expects 'Id' as the correct key

    return this.httpClient.post(`${this.CorrsondanceViewURL}`, formData, { headers }).pipe(
      catchError((error) => {
        console.error('Error while marking correspondence as read', error.message);
        return throwError(() => error); // Proper error handling
      })
    );
  }

  getMyTransfer(accessToken: string, id: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
    });

    const params = new URLSearchParams();
    params.set('id', id);

    const urlWithParams = `${this.myTransferURL}?${params.toString()}`;

    return this.httpClient.get(urlWithParams, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching My Transfer', error.message);
          throw error;
        })
      );
  }
  fetchData(url: string, structureId: string,
    page: number, pageSize: number, accessToken: string,
    nodeId:string,
    purposeId?: string // Optional parameter
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    const formData = new FormData();
    formData.append('draw', '1');
    formData.append('start', ((page - 1) * pageSize).toString());
    formData.append('length', pageSize.toString());
    formData.append('structureId', structureId);
    formData.append('NodeId', nodeId);
    // Only append PurposeId if it's provided
    if (purposeId) {
      formData.append('PurposeId', purposeId);
    }
    return this.httpClient.post<any>(`${environment.apiBaseUrl}${url}`, formData, { headers });
  }

  getPriorities(): Observable<any> {
    return this.httpClient.get(`${environment.apiBaseUrl}/Priority/List`);
  }

  getClassifications(language: string): Observable<any> {
    const headers = new HttpHeaders().set('Accept-Language', language);
    return this.httpClient.get(`${environment.apiBaseUrl}/Classification/ListClassifications`, { headers });
  }

  getPrivacy(language: string): Observable<any> {
    const headers = new HttpHeaders().set('Accept-Language', language);
    return this.httpClient.get(`${environment.apiBaseUrl}/Privacy/ListPrivacies`, { headers });
  }

  getImportance(language: string): Observable<any> {
    const headers = new HttpHeaders().set('Accept-Language', language);
    return this.httpClient.get(`${environment.apiBaseUrl}/Importance/ListImportances`, { headers });
  }

  getDocumentType(language: string): Observable<any> {
    const headers = new HttpHeaders().set('Accept-Language', language);
    return this.httpClient.get(`${environment.apiBaseUrl}/DocumentType/GetDocumentType`, { headers });
  }

  getPurpose(language: string): Observable<any> {
    const headers = new HttpHeaders().set('Accept-Language', language);
    return this.httpClient.get(`${environment.apiBaseUrl}/Purpose/ListPurposes`, { headers });
  }

  getCCopy(language: string, attributes: string[]): Observable<any> {
    const token = localStorage.getItem('access_token'); // Retrieve token from local storage

    const headers = new HttpHeaders({
      'Accept-Language': language,
      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    });
    const body = {
      text: '',
      language: language,
      attributes: attributes
    };

    return this.httpClient.post(`${environment.apiBaseUrl}/api/SearchStructuresWithSearchAttributes`, body, { headers });
  }



}
