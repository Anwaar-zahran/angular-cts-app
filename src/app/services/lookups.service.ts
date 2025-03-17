import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Priority } from '../models/priority.model';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LookupsService {
  private listUsersUrl = `${environment.iAMUrl}/api/SearchUsersByStructureIds`;
  private listPrivaciesEN = `${environment.apiBaseUrl}/Privacy/ListPrivacies`;
  private listPrivacies = `${environment.apiBaseUrl}/Privacy/List?Name=`;
  private listCategories = `${environment.apiBaseUrl}/Category/ListCategories`;
  //private listCategories = `${environment.apiBaseUrl}/Category/List?Name`;
  private listCategoriesByName = `${environment.apiBaseUrl}/Category/List?Name`;
  private listEntities = `${environment.iAMUrl}/api/SearchStructuresWithSearchAttributes`;
  private listSearchUsers = `${environment.iAMUrl}/api/SearchUsers`;
  private listStructuredUsers = `${environment.apiBaseUrl}/User/GetUsersStructuresFromCTS`;
  private listDelegateToUsers = `${environment.apiBaseUrl}/CTS/Delegation/ListDelegationToUser`;
  private listImportanceEN = `${environment.apiBaseUrl}/Importance/ListImportances`;
  private listImportance = `${environment.apiBaseUrl}/Importance/List?Name=`;
  private listStatus = `${environment.apiBaseUrl}/Status/ListStatuses`;
  private listStatusByName = `${environment.apiBaseUrl}/Status/List?Name=`;
  private listPrioritiesEN = `${environment.apiBaseUrl}/Priority/ListPriorities`;
  private listPriorities = `${environment.apiBaseUrl}/Priority/List?Name=`;
  private listYears = `${environment.apiBaseUrl}/Dashboard/GetAvailableYears`;
  private listPurposes = `${environment.apiBaseUrl}/CTS/Purpose/ListUserPurposes`;
  private listClassificationEN = `${environment.apiBaseUrl}/Classification/List`;
 // private listClassification = `${environment.apiBaseUrl}/Classification/List?Name=`;
  private listClassification = `${environment.apiBaseUrl}/Classification/ListClassifications`;
  private listDocumentType = `${environment.apiBaseUrl}/DocumentType/List`;
  //private listDocumentType = `${environment.apiBaseUrl}/DocumentType/GetDocumentType`;
  //private listPrioritiesWithDays = `${environment.apiBaseUrl}/Priority/List`;
  private listPrioritiesWithDays = `${environment.apiBaseUrl}/Priority/List?Name=`;

  currentLang: string = 'en';

  constructor(private http: HttpClient, private translate: TranslateService) {

    this.currentLang = this.translate.currentLang;
  }

  getPrivacyOptions(): Observable<any[]> {
    // Replace with actual API call
    const privacyOptions = [
      { id: 1, name: 'Normal' },
      { id: 2, name: 'Confidential' },
      { id: 3, name: 'High Confidential' }
    ];
    return of(privacyOptions);
  }

  getCarbonUsers(accessToken: string): Observable<any> {

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    const formData = new FormData();
    formData.append('text', '');
    formData.append('language', 'en');
    formData.append('attributes[]', 'NameAr');
    formData.append('attributes[]', 'NameFr');


    return this.http.post(this.listStructuredUsers, formData, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching structured users data', error.message);
          throw error;
        })
      );
  }

  getPriorityOptions(): Observable<Priority[]> {
    return this.http.get<Priority[]>(`${environment.apiBaseUrl}/Priority/ListPriorities`);
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
  getUsersWithSearch(accessToken: string, textToSearch: string): Observable<any> {

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'accept-language': this.currentLang
    });

    const formData = new FormData();
    formData.append('ids[]', JSON.stringify(1));
    formData.append('text', textToSearch);
    formData.append('language', '');
    formData.append('showOnlyActiveUsers', 'true');


    return this.http.post(this.listUsersUrl, formData, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching users', error.message);
          throw error;
        })
      );
  }

  getImportanceEn(accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(this.listImportanceEN, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching Importance data', error.message);
          throw error;
        })
      );
  }

  getPrivacyEn(accessToken: string): Observable<any> {
    debugger;
    //let culture = this.cookieService.get('AspNetCore.Culture');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });
    return this.http.get(this.listPrivaciesEN, {
      headers })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching privacies data', error.message);
          throw error;
        })
      );
  }

  getClassficationEn(accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(this.listClassificationEN, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching classification data', error.message);
          throw error;
        })
      );
  }

  getPrioritiesEn(accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(this.listPrioritiesEN, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching priorities data', error.message);
          throw error;
        })
      );
  }

  getPrivacy(accessToken: string): Observable<any> {

    console.log('currentLang', this.currentLang);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'accept-language': this.currentLang
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
      'Content-Type': 'application/json',
      'accept-language': this.currentLang
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

  getDocumentTypes(accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });
    const params = new URLSearchParams();
    params.set('Name', '');

    const url = `${this.listDocumentType}?${params.toString()}`;
    // const url = `${this.listDocumentType}`;

    return this.http.get(url, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching document type data', error.message);
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

  getCategoriesByName(delegationId: string | undefined): Observable<{ id: number, text: string }[]> {
    let params = new HttpParams();
    if (delegationId !== undefined) {
      params = params.set('delegationId', delegationId);
    }

    return this.http.get<{ id: number, text: string }[]>(this.listCategoriesByName, { params })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching categories data', error.message);
          throw error;
        })
      );
  }

  getSearchableEntities(text: string): Observable<any> {
    const formData = new FormData();
    formData.append('text', text);
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

  getSearchUsers(accessToken: string, text: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });

    let params = new HttpParams();

    params = params.set('text', text);
    const lang = localStorage.getItem("language") || 'en';
    params = params.set('language', lang);

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
  getStatusByName(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get(this.listStatusByName, { headers })
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

  getPrioritiesWithDays(accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(this.listPrioritiesWithDays, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error while fetching priorities data with getting days', error.message);
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
