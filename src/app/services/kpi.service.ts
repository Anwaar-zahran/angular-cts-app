import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KpiService {
  private baseUrl = environment.apiBaseUrl;
  private iamUrl=environment.iAMUrl;
  constructor(private http: HttpClient) { }

  GetAverageDurationForCorrespondenceCompletion(year: number): Observable<any> {
    const formData = new FormData();
    formData.append('year', year.toString());

    return this.http.post(`${this.baseUrl}/Dashboard/GetAverageDurationForCorrespondenceCompletion`, formData);
  }

  GetAverageDurationForCorrespondenceCompletionV2(structureId: number, year: number): Observable<any> {
    const formData = new FormData();
    formData.append('year', year.toString());
    formData.append('structureId', structureId.toString());

    return this.http.post(`${this.baseUrl}/Dashboard/GetAverageDurationForCorrespondenceCompletion`, formData);
  }

  ListStructureAverageDurationForCorrespondenceCompletion(year: number): Observable<any> {
    const formData = new FormData();
    formData.append('year', year.toString());
    return this.http.post(`${this.baseUrl}/Dashboard/ListStructureAverageDurationForCorrespondenceCompletion`, formData);
  }

  ListUserStructureAverageDurationForCorrespondenceCompletion(StructureId: number, year: number): Observable<any> {
    const formData = new FormData();
    formData.append('year', year.toString());
    formData.append('StructureId', StructureId.toString());
    return this.http.post(`${this.baseUrl}/Dashboard/ListUserStructureAverageDurationForCorrespondenceCompletion`, formData);
  }

  GetAverageDurationForCorrespondenceDelay(year: number): Observable<any> {
    const formData = new FormData();
    formData.append('year', year.toString());

    return this.http.post(`${this.baseUrl}/Dashboard/GetAverageDurationForCorrespondenceDelay`, formData);
  }

  GetAverageDurationForCorrespondenceDelayV2(structureId: number, year: number): Observable<any> {
    const formData = new FormData();
    formData.append('year', year.toString());
    formData.append('structureId', structureId.toString());

    return this.http.post(`${this.baseUrl}/Dashboard/GetAverageDurationForCorrespondenceDelay`, formData);
  }

  ListStructureAverageDurationForCorrespondenceDelay(year: number): Observable<any> {
    const formData = new FormData();
    formData.append('year', year.toString());
    return this.http.post(`${this.baseUrl}/Dashboard/ListStructureAverageDurationForCorrespondenceDelay`, formData);
  }

  ListUserStructureAverageDurationForCorrespondenceDelay(structureId: number, year: number): Observable<any> {
    const formData = new FormData();
    formData.append('year', year.toString());
    formData.append('structureId', structureId.toString());
    return this.http.post(`${this.baseUrl}/Dashboard/ListUserStructureAverageDurationForCorrespondenceDelay`, formData);
  }


  GetAverageDurationForTransferCompletion(year: number): Observable<any> {
    const formData = new FormData();
    formData.append('year', year.toString());
    return this.http.post(`${this.baseUrl}/Dashboard/GetAverageDurationForTransferCompletion`, formData);
  }

  GetAverageDurationForTransferCompletionV2(structureId: number, year: number): Observable<any> {
    const formData = new FormData();
    formData.append('year', year.toString());
    formData.append('structureId', structureId.toString());
    return this.http.post(`${this.baseUrl}/Dashboard/GetAverageDurationForTransferCompletion`, formData);
  }

  ListStructureAverageDurationForTransferCompletion(year: number): Observable<any> {
    const formData = new FormData();
    formData.append('year', year.toString());
    return this.http.post(`${this.baseUrl}/Dashboard/ListStructureAverageDurationForTransferCompletion`, formData);
  }

  ListUserStructureAverageDurationForTransferCompletion(structureId: number, year: number): Observable<any> {
    const formData = new FormData();
    formData.append('year', year.toString());
    formData.append('structureId', structureId.toString());
    return this.http.post(`${this.baseUrl}/Dashboard/ListUserStructureAverageDurationForTransferCompletion`, formData);
  }


  GetAverageDurationForTransferDelay(year: number): Observable<any> {
    const formData = new FormData();
    formData.append('year', year.toString());
    return this.http.post(`${this.baseUrl}/Dashboard/GetAverageDurationForTransferDelay`, formData);
  }

  GetAverageDurationForTransferDelayV2(structureId: number, year: number): Observable<any> {
    const formData = new FormData();
    formData.append('year', year.toString());
    formData.append('structureId', structureId.toString());
    return this.http.post(`${this.baseUrl}/Dashboard/GetAverageDurationForTransferDelay`, formData);
  }

  ListStructureAverageDurationForTransferDelay(year: number): Observable<any> {
    const formData = new FormData();
    formData.append('year', year.toString());
    return this.http.post(`${this.baseUrl}/Dashboard/ListStructureAverageDurationForTransferDelay`, formData);
  }

  ListUserStructureAverageDurationForTransferDelay(StructureId: number, year: number): Observable<any> {
    const formData = new FormData();
    formData.append('year', year.toString());
    formData.append('StructureId', StructureId.toString());
    return this.http.post(`${this.baseUrl}/Dashboard/ListUserStructureAverageDurationForTransferDelay`, formData);
  }

  GetStructureById(structureId: number): Observable<any> {
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
      console.error('Access token not found');
      return throwError(() => new Error('Unauthorized: No access token'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<any>(`${this.baseUrl}/api/GetStructure?id=${structureId}`, { headers })
      .pipe(
        catchError(error => {
          console.error('Error fetching structure:', error);
          return throwError(() => new Error('Failed to fetch structure data'));
        })
      );
  }


  GetUserById(userId: number): Observable<any> {
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
      console.error('Access token not found');
      return throwError(() => new Error('Unauthorized: No access token'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
    });

    return this.http.get(`${this.iamUrl}/api/GetUser?id=${userId}`, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching user:', error);
        return throwError(() => error);
      })
    );
  }



}
