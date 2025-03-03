import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChartsService {
  httpPostHeader = {
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'x-requested-with': 'XMLHttpRequest'
  };
  private baseUrl = environment.apiBaseUrl;
  constructor(private http: HttpClient) { }



  getTransferCompletionStatistics({ fromDate, toDate, structureId }: { fromDate: string, toDate: string, structureId: string }) {
    const formData = new FormData();
    formData.append('fromDate', fromDate);
    formData.append('toDate', toDate);
    formData.append('structureId', structureId);
    return this.http.post(`${this.baseUrl}/Dashboard/GetTransferAverageCompletionTimeByUser`, formData);
  }

  GetDocumentsCompletedAndInProgressByUser
    ({ fromDate, toDate, structureId, categoryIds }: { fromDate: string, toDate: string, structureId: string, categoryIds: string[] }) {
    const formData = new FormData();
    formData.append('fromDate', fromDate);
    formData.append('toDate', toDate);
    formData.append('structureId', structureId);
    formData.append('categoryIds', categoryIds.join(','));
    return this.http.post<{ text: string, count: number }[]>(`${this.baseUrl}/Dashboard/GetDocumentsCompletedAndInProgressByUser`, formData);
  }

  GetDocumentsInProgressOverdueAndOnTimePerCategoryByUser
    ({ fromDate, toDate, structureId }: { fromDate: string, toDate: string, structureId: string }): Observable<{ overDue: any[], onTime: { categoryId: number, count: number }[] }> {
    const params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate)
      .set('structureId', structureId);

    return this.http.get<{ overDue: any[], onTime: { categoryId: number, count: number }[] }>(`${this.baseUrl}/Dashboard/GetDocumentsInProgressOverdueAndOnTimePerCategoryByUser`, { params });
  }

  GetTransfersInProgressOverdueAndOnTimePerCategoryByUser
    ({ fromDate, toDate, structureId }: { fromDate: string, toDate: string, structureId: string }): Observable<{ overDue: any[], onTime: { categoryId: number, count: number }[] }> {
    const params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate)
      .set('structureId', structureId);

    return this.http.get<{ overDue: any[], onTime: { categoryId: number, count: number }[] }>(`${this.baseUrl}/Dashboard/GetTransfersInProgressOverdueAndOnTimePerCategoryByUser`, { params });
  }

  GetTransfersCompletedOverdueAndOnTimePerCategoryByUser
    ({ fromDate, toDate, structureId }: { fromDate: string, toDate: string, structureId: string }): Observable<{ overDue: any[], onTime: { categoryId: number, count: number }[] }> {
    const params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate)
      .set('structureId', structureId);

    return this.http.get<{ overDue: any[], onTime: { categoryId: number, count: number }[] }>(`${this.baseUrl}/Dashboard/GetTransfersCompletedOverdueAndOnTimePerCategoryByUser`, { params });
  }
  GetDocumentsCompletedOverdueAndOnTimePerCategoryByUser
    ({ fromDate, toDate, structureId }: { fromDate: string, toDate: string, structureId: string }): Observable<{ overDue: any[], onTime: { categoryId: number, count: number }[] }> {
    const params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate)
      .set('structureId', structureId);
    return this.http.get<{ overDue: any[], onTime: { categoryId: number, count: number }[] }>(`${this.baseUrl}/Dashboard/GetDocumentsCompletedOverdueAndOnTimePerCategoryByUser`, { params });
  }

  GetCountPerCategoryAndStatusByUser
    ({ fromDate, toDate, structureId }: { fromDate: string, toDate: string, structureId: string }): Observable<{ overDue: any[], onTime: { categoryId: number, count: number }[] }> {
    const params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate)
      .set('structureId', structureId);
    return this.http.get<{ overDue: any[], onTime: { categoryId: number, count: number }[] }>(`${this.baseUrl}/Dashboard/GetCountPerCategoryAndStatusByUser`, { params });
  }


  GetCountPerCategoryAndStatus
    ({ fromDate, toDate, structureId }: { fromDate: string, toDate: string, structureId: string | undefined }): Observable<any> {


    const params = new HttpParams()
      .set('FromDate', fromDate)
      .set('ToDate', toDate)
      .set('StructureIds', structureId || '');

    return this.http.post<any>(
      `${this.baseUrl}/Dashboard/GetCountPerCategoryAndStatus`,
      params.toString(),
      { headers: this.httpPostHeader }
    );
  }

  GetStatisticsPerDepartment({ fromDate, toDate, structureIds }: { fromDate: string, toDate: string, structureIds?: string[] | undefined }): Observable<any> {
    const params = new HttpParams()
      .set('FromDate', fromDate)
      .set('ToDate', toDate)
      .set('StructureIds', structureIds?.join(',') || '');

    return this.http.post<any>(
      `${this.baseUrl}/Dashboard/GetStatisticsPerDepartment`,
      params.toString(),
      { headers: this.httpPostHeader }
    );
  }

  GetDocumentsInProgressOverdueAndOnTimePerCategory({ fromDate, toDate, structureIds }: { fromDate: string, toDate: string, structureIds?: string[] | undefined }): Observable<any> {
    const params = new HttpParams()
      .set('FromDate', fromDate)
      .set('ToDate', toDate)
      .set('StructureIds', structureIds?.join(',') || '');

    return this.http.post<any>(
      `${this.baseUrl}/Dashboard/GetDocumentsInProgressOverdueAndOnTimePerCategory`,
      params.toString(),
      { headers: this.httpPostHeader }
    );
  }

  GetDocumentsCompletedOverdueAndOnTimePerCategory({ fromDate, toDate, structureIds }: { fromDate: string, toDate: string, structureIds?: string[] | undefined }): Observable<any> {
    const params = new HttpParams()
      .set('FromDate', fromDate)
      .set('ToDate', toDate)
      .set('StructureIds', structureIds?.join(',') || '');

    return this.http.post<any>(
      `${this.baseUrl}/Dashboard/GetDocumentsCompletedOverdueAndOnTimePerCategory`,
      params.toString(),
      { headers: this.httpPostHeader }
    );
  }

  GetTransfersInProgressOverdueAndOnTimePerCategory({ fromDate, toDate, structureIds }: { fromDate: string, toDate: string, structureIds?: string[] | undefined }): Observable<any> {
    const params = new HttpParams()
      .set('FromDate', fromDate)
      .set('ToDate', toDate)
      .set('StructureIds', structureIds?.join(',') || '');

    return this.http.post<any>(
      `${this.baseUrl}/Dashboard/GetTransfersInProgressOverdueAndOnTimePerCategory`,
      params.toString(),
      { headers: this.httpPostHeader }
    );
  }

  GetTransfersCompletedOverdueAndOnTimePerCategory({ fromDate, toDate, structureIds }: { fromDate: string, toDate: string, structureIds?: string[] | undefined }): Observable<any> {
    const params = new HttpParams()
      .set('FromDate', fromDate)
      .set('ToDate', toDate)
      .set('StructureIds', structureIds?.join(',') || '');

    return this.http.post<any>(
      `${this.baseUrl}/Dashboard/GetTransfersCompletedOverdueAndOnTimePerCategory`,
      params.toString(),
      { headers: this.httpPostHeader }
    );
  }

}
