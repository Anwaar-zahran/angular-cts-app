import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KpiService {
  private baseUrl = environment.apiBaseUrl;
  constructor(private http: HttpClient) { }

  GetAverageDurationForCorrespondenceCompletion(year: number): Observable<any> {
    const formData = new FormData();
    formData.append('year', year.toString());

    return this.http.post(`${this.baseUrl}/Dashboard/GetAverageDurationForCorrespondenceCompletion`, formData);
  }

  ListStructureAverageDurationForCorrespondenceCompletion(year: number): Observable<any> {
    const formData = new FormData();
    formData.append('year', year.toString());
    return this.http.post(`${this.baseUrl}/Dashboard/ListStructureAverageDurationForCorrespondenceCompletion`, formData);
  }

  GetAverageDurationForCorrespondenceDelay(year: number): Observable<any> {
    const formData = new FormData();
    formData.append('year', year.toString());

    return this.http.post(`${this.baseUrl}/Dashboard/GetAverageDurationForCorrespondenceDelay`, formData);
  }

  ListStructureAverageDurationForCorrespondenceDelay(year: number): Observable<any> {
    const formData = new FormData();
    formData.append('year', year.toString());
    return this.http.post(`${this.baseUrl}/Dashboard/ListStructureAverageDurationForCorrespondenceDelay`, formData);
  }


  GetAverageDurationForTransferCompletion(year: number): Observable<any> {
    const formData = new FormData();
    formData.append('year', year.toString());
    return this.http.post(`${this.baseUrl}/Dashboard/GetAverageDurationForTransferCompletion`, formData);
  }

  ListStructureAverageDurationForTransferCompletion(year: number): Observable<any> {
    const formData = new FormData();
    formData.append('year', year.toString());
    return this.http.post(`${this.baseUrl}/Dashboard/ListStructureAverageDurationForTransferCompletion`, formData);
  }


  GetAverageDurationForTransferDelay(year: number): Observable<any> {
    const formData = new FormData();
    formData.append('year', year.toString());
    return this.http.post(`${this.baseUrl}/Dashboard/GetAverageDurationForTransferDelay`, formData);
  }

  ListStructureAverageDurationForTransferDelay(year: number): Observable<any> {
    const formData = new FormData();
    formData.append('year', year.toString());
    return this.http.post(`${this.baseUrl}/Dashboard/ListStructureAverageDurationForTransferDelay`, formData);
  }


}
