import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class ChartsService {
  private baseUrl = 'https://cts-qatar.d-intalio.com';
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
    ({ fromDate, toDate, structureId }: { fromDate: string, toDate: string, structureId: string }): Observable<{ overDue: any[], onTime: { categoryId: number, count: number }[] }> {
    const params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate)
      .set('structureId', structureId);
    return this.http.post<{ overDue: any[], onTime: { categoryId: number, count: number }[] }>(`${this.baseUrl}/Dashboard/GetCountPerCategoryAndStatus`, { params });
  }

  GetStatisticsPerDepartment({ fromDate, toDate, structureIds }: { fromDate: string, toDate: string, structureIds?: string[] | null }): Observable<{ overDue: any[], onTime: { categoryId: number, count: number }[] }> {
    let params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate);

    if (structureIds && structureIds.length > 0) {
      params = params.set('structureIds', structureIds.join(','));
    }

    return this.http.post<{ overDue: any[], onTime: { categoryId: number, count: number }[] }>(`${this.baseUrl}/Dashboard/GetStatisticsPerDepartment`, { params });
  }

  GetDocumentsInProgressOverdueAndOnTimePerCategory({ fromDate, toDate, structureIds }: { fromDate: string, toDate: string, structureIds?: string[] | null }): Observable<{ overDue: any[], onTime: { categoryId: number, count: number }[] }> {
    let params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate);

    if (structureIds && structureIds.length > 0) {
      params = params.set('structureIds', structureIds.join(','));
    }
    return this.http.post<{ overDue: any[], onTime: { categoryId: number, count: number }[] }>(`${this.baseUrl}/Dashboard/GetDocumentsInProgressOverdueAndOnTimePerCategory`, { params });
  }

  GetDocumentsCompletedOverdueAndOnTimePerCategory
    ({ fromDate, toDate, structureIds }: { fromDate: string, toDate: string, structureIds?: string[] | null }): Observable<{ overDue: any[], onTime: { categoryId: number, count: number }[] }> {
    let params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate);

    if (structureIds && structureIds.length > 0) {
      params = params.set('structureIds', structureIds.join(','));
    }
    return this.http.post<{ overDue: any[], onTime: { categoryId: number, count: number }[] }>(`${this.baseUrl}/Dashboard/GetDocumentsCompletedOverdueAndOnTimePerCategory`, { params });
  }

  GetTransfersInProgressOverdueAndOnTimePerCategory
    ({ fromDate, toDate, structureIds }: { fromDate: string, toDate: string, structureIds?: string[] | null }): Observable<{ overDue: any[], onTime: { categoryId: number, count: number }[] }> {
    let params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate);

    if (structureIds && structureIds.length > 0) {
      params = params.set('structureIds', structureIds.join(','));
    }
    return this.http.post<{ overDue: any[], onTime: { categoryId: number, count: number }[] }>(`${this.baseUrl}/Dashboard/GetTransfersInProgressOverdueAndOnTimePerCategory`, { params });
  }

  GetTransfersCompletedOverdueAndOnTimePerCategory
    ({ fromDate, toDate, structureIds }: { fromDate: string, toDate: string, structureIds?: string[] | null }): Observable<{ overDue: any[], onTime: { categoryId: number, count: number }[] }> {
    let params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate)

    if (structureIds && structureIds.length > 0) {
      params = params.set('structureIds', structureIds.join(','));
    }
    return this.http.post<{ overDue: any[], onTime: { categoryId: number, count: number }[] }>(`${this.baseUrl}/Dashboard/GetTransfersCompletedOverdueAndOnTimePerCategory`, { params });
  }

}
