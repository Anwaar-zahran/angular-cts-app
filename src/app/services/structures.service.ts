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

    getStructureById(id: number | undefined): Observable<CurrentUserStructures> {
        
        return this.http.get<CurrentUserStructures>(`${this.baseUrl}/GetUser?id=${id}`);
    }
    
} 