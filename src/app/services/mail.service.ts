import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MailsService {
  private replyToURL = 'https://cts-qatar.d-intalio.com/CTS/Delegation/Save';
  private transferURL = 'https://cts-qatar.d-intalio.com/Transfer/Transfer';

  constructor(private httpClient: HttpClient) { }

  transferMail(accessToken: string, model: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json', // Only one Content-Type header is needed
    });

    const params = new URLSearchParams();
    params.set('delegationId', '');
    params.set('maintainTransfer', 'false'); 
    params.set('withSign', 'false'); 
    params.set('signatureTemplateId', '');

    const url = `${this.transferURL}?${params.toString()}`;

    return this.httpClient.post(url, model, { headers }).pipe(
      catchError((error) => {
        console.error('Error while transferring mail', error.message);
        throw error;
      })
    );
  }
}
