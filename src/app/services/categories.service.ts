import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Category } from '../models/category.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CategoriesService {
    private baseUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient) { }

    ListCategories(delegationId: string = ''): Observable<Category[]> {
         
        const params = new HttpParams()
            .set('delegationId', delegationId)

        // return this.http.get<Category[]>(`${this.baseUrl}/Category/ListCategories`, { params })
        //     .pipe(
        //         map(response => Array.isArray(response) ? response : [])

        //     );
        return this.http.get<Category[]>(`${this.baseUrl}/Category/ListCategories`, { params })
            .pipe(
                map(response => Array.isArray(response) ? response : []) // Process the response
            );
    }


} 