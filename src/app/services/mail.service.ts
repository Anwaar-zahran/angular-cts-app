import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class MailsService {
  private replyToURL = `${environment.apiBaseUrl}/Transfer/Reply`;
  private transferURL = `${environment.apiBaseUrl}/Transfer/Transfer`;

  constructor(private httpClient: HttpClient) { }

  transferMail(accessToken: string,  model: any[]): Observable<any> {
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
    debugger;

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
}
