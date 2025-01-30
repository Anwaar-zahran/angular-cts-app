import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SearchFilter } from '../../app/models/searchFilter.model';

@Injectable({
  providedIn: 'root'
})
export class SearchPageService {
  private searchApiUrl = 'https://cts-qatar.d-intalio.com/Search/List';
  private saveDelegation = 'https://cts-qatar.d-intalio.com/CTS/Delegation/Save';

  constructor(private httpClient: HttpClient) { }

  searchInbox(accessToken: string, searchModel:SearchFilter): Observable<any> {
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



}

