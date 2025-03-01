import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Structure } from '../models/structure.model';
import { environment } from '../../environments/environment';
import { CurrentUserStructures } from '../models/current-user-structures';

@Injectable({
    providedIn: 'root'
})
export class StructuresService {
    private baseUrl = `${environment.iAMUrl}/Api`;
    private apiBaseUrl = `${environment.apiBaseUrl}`;
    constructor(private http: HttpClient) { }

    searchStructures(searchText: string = ''): Observable<Structure[]> {
        const formData = new URLSearchParams();
        formData.append('text', searchText);
        formData.append('attributes[]', 'NameAr');
        formData.append('attributes[]', 'NameFr');

        return this.http.post<Structure[]>(
            `${this.baseUrl}/SearchStructuresWithSearchAttributes`,
            formData.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
    }

    getStructureById(id: string | undefined): Observable<CurrentUserStructures> {
        console.log('id:', id);
        return this.http.get<CurrentUserStructures>(`${this.baseUrl}/GetUser?id=${id}`);
    }
    UpdateLoggedInStrucure(structureId: string | undefined,oldStrutureId: string | undefined,accessToken: string): Observable<string> {
       debugger
       const headers = new HttpHeaders({
        'Authorization': `Bearer ${accessToken}`
      });
        console.log('structureId:', structureId);
        console.log('oldStrutureId:', oldStrutureId);
        const url = `${this.apiBaseUrl}/CTS/Structure/UpdateLoggedInStrucure?structureId=${structureId}&oldStrutureId=${oldStrutureId}`;
        return this.http.post<string>(url, null, { headers }); // Provide `null` as the bodyreturn this.http.post<string>(`${this.apiBaseUrl}/CTS/Structure/UpdateLoggedInStrucure??structureId=${structureId}&oldStrutureId=${oldStrutureId}`);
    }
    
    
} 