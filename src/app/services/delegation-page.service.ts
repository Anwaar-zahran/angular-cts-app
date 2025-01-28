import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class DelegationPageService {
  private apiUrl = 'https://cts-qatar.d-intalio.com/CTS/Delegation/List';
  //private apiUrl = 'https://cts-qatar.d-intalio.com/Delegation/List'; 
  private saveDelegation = 'https://cts-qatar.d-intalio.com/CTS/Delegation/Save';
  private deleteDelegationURL = 'https://cts-qatar.d-intalio.com/CTS/Delegation/Delete';

  constructor(private httpClient: HttpClient) { }

  getDelegations(accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      // 'Content-Type': 'application/json', 
    });
    const draw = 0;
    const start = 0;
    const length = 10;

    const body = new URLSearchParams();
    body.set('draw', draw.toString());
    body.set('start', start.toString());
    body.set('length', length.toString());

    return this.httpClient.post(this.apiUrl, body.toString(), { headers })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching data', error.message);
          throw error;
        })
      );
  }


  updateDelegate(accessToken: string, updatedItem: any): Observable<any> {

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    const formData = new FormData();
    // formData.append('CategoryIds[]', JSON.stringify(updatedItem.categoryIds));
    updatedItem["categoryIds"].forEach((categoryId: number) => {
      formData.append('CategoryIds[]', JSON.stringify(categoryId));
    });
    formData.append('ToUserId', updatedItem["toUser"]);
    formData.append('PrivacyId', updatedItem["privacyId"]);
    formData.append('FromDate', updatedItem["fromDate"]);
    formData.append('ToDate', updatedItem["toDate"]);
    formData.append('ShowOldCorespondence', updatedItem["showOldCorrespondecne"]);
    formData.append('AllowSign', updatedItem["allowSign"]);
    formData.append('DraftInbox', 'false');
    formData.append('StartDate', '');
    formData.append('Note', '');
    if (updatedItem.id)
      formData.append('Id', updatedItem.id);


    return this.httpClient.post(this.saveDelegation, formData, { headers })
      .pipe(
        catchError((error) => {
          // console.error('Error while saving' + updatedItem.id+": ", error.message);
          console.error('Error while saving', error.message);
          throw error;
        })
      );
  }

  deleteDelegate(accessToken: string, idTodelete: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    // Prepare FormData
    const formData = new FormData();
    formData.append('ids[]', JSON.stringify(idTodelete));

    return this.httpClient.delete(this.deleteDelegationURL, {
      headers: headers,
      body: formData
    }).pipe(
      catchError((error) => {
        console.error('Error while deleting:', error.message);
        throw error;
      })
    );
  }

}

