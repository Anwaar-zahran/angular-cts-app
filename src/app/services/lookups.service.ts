import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Priority } from '../models/priority.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { catchError } from 'rxjs/operators';
import { JsonPipe } from '@angular/common';
@Injectable({
  providedIn: 'root'
})
export class LookupsService {
  private listUsersUrl = 'https://iam-qatar.d-intalio.com/api/SearchUsersByStructureIds';
  private listPrivacies = 'https://cts-qatar.d-intalio.com/Privacy/ListPrivacies';
  private listCategories = 'https://cts-qatar.d-intalio.com/Category/ListCategories';
  private listEntities = 'https://iam-qatar.d-intalio.com/api/SearchStructuresWithSearchAttributes';
  private listSearchUsers = 'https://iam-qatar.d-intalio.com/api/SearchUsers';
  private listStructuredUsers = 'https://cts-qatar.d-intalio.com/User/GetUsersStructuresFromCTS';
  private listDelegateToUsers = 'https://cts-qatar.d-intalio.com/CTS/Delegation/ListDelegationToUser';
  private listImportance = 'https://cts-qatar.d-intalio.com/Importance/ListImportances';
  private listStatus = 'https://cts-qatar.d-intalio.com/Status/ListStatuses';
  private listPriorities = 'https://cts-qatar.d-intalio.com/Priority/ListPriorities';
  private listYears = 'https://cts-qatar.d-intalio.com/Dashboard/GetAvailableYears';
  private listPurposes = 'https://cts-qatar.d-intalio.com/CTS/Purpose/ListUserPurposes';
  private listClassification = 'https://cts-qatar.d-intalio.com/Classification/List';
  //private listImportance = 'https://cts-qatar.d-intalio.com/Importance/List';

  constructor(private http: HttpClient) { }

  getPrivacyOptions(): Observable<any[]> {
    // Replace with actual API call
    const privacyOptions = [
      { id: 1, name: 'Normal' },
      { id: 2, name: 'Confidential' },
      { id: 3, name: 'High Confidential' }
    ];
    return of(privacyOptions);
  }

  getPriorityOptions(): Observable<Priority[]> {
    return this.http.get<Priority[]>('https://cts-qatar.d-intalio.com/Priority/ListPriorities');
  }

  getUsers(accessToken: string): Observable<any> {

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    const formData = new FormData();
    formData.append('ids[]', JSON.stringify(1));
    formData.append('text', '');
    formData.append('language', '');
    formData.append('showOnlyActiveUsers', 'true');


    return this.http.post(this.listUsersUrl, formData, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching users data', error.message);
          throw error;
        })
      );
  }

  getPrivacy(accessToken: string): Observable<any> {

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });
    return this.http.get(this.listPrivacies, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching privacies data', error.message);
          throw error;
        })
      );
  }

  getPurposes(accessToken: string): Observable<any> {

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });
    return this.http.get(this.listPurposes, { headers })
      .pipe(
        catchError((error) => {
        console.error('Error while fetching Purposes data', error.message);
          throw error;
        })
      );
  }

  getStructuredUsers(accessToken: string): Observable<any> {

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    const formData = new FormData();
    formData.append('structureType', JSON.stringify(1));
    formData.append('searchText', '');
    formData.append('delegationId', '');
    formData.append('fromSendingandReceiving', 'false');


    return this.http.post(this.listStructuredUsers, formData, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching structured users data', error.message);
          throw error;
        })
      );
  }


  getCategories(delegationId: string | undefined): Observable<{ id: number, text: string }[]> {
    let params = new HttpParams();
    if (delegationId !== undefined) {
      params = params.set('delegationId', delegationId);
    }

    return this.http.get<{ id: number, text: string }[]>(this.listCategories, { params })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching categories data', error.message);
          throw error;
        })
      );
  }

  getEntities(): Observable<any> {


    const formData = new FormData();
    formData.append('attributes[]', JSON.stringify("NameAr"));
    formData.append('attributes[]', JSON.stringify("NameFr"));

    return this.http.post(this.listEntities, formData)
      .pipe(
        catchError((error) => {
          console.error('Error while entities data', error.message);
          throw error;
        })
      );
  }

  getSearchUsers(accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });

    let params = new HttpParams();

    params = params.set('text', '');
    params = params.set('language', 'en');

    return this.http.get(this.listSearchUsers, { headers, params })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching search users data', error.message);
          throw error;
        })
      );
  }

  getDelegationToUsers(accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(this.listDelegateToUsers, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching delegation To users data', error.message);
          throw error;
        })
      );
  }

  getImportance(accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(this.listImportance, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching Importance data', error.message);
          throw error;
        })
      );
  }

  getClassfication(accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(this.listClassification, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching classification data', error.message);
          throw error;
        })
      );
  }

  getStatus(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get(this.listStatus, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching Status data', error.message);
          throw error;
        })
      );
  }

  getPriorities(accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(this.listPriorities, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching priorities data', error.message);
          throw error;
        })
      );
  }

  getYears(): Observable<any> {
    return this.http.get(this.listYears)
      .pipe(
        catchError((error) => {
          console.error('Error while fetching years data', error.message);
          throw error;
        })
      );
  }


}
