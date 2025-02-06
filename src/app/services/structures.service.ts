import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Structure } from '../models/structure.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class StructuresService {
    private baseUrl = `${environment.iAMUrl}/api`;

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
} 