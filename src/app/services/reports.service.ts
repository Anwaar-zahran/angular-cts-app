import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Category } from '../models/category.model';
import { InprogressCorrespondence } from '../models/inprogress-correspondence.model';
import { InprogressReport } from '../models/inprogress-report.model';
import { CategoriesService } from '../services/categories.service';
import { environment } from '../../environments/environment';
@Injectable({
    providedIn: 'root'
})
export class ReportsService {
    private baseUrl = `${environment.apiBaseUrl}`;

    constructor(private http: HttpClient, private CategoriesService: CategoriesService) { }

    listInProgressTransfers(params?: {
        structureIds?: number[],
        userIds?: number[],
        fromDate?: string,
        toDate?: string,
        isOverdue?: boolean,
        page?: number,
        pageSize?: number
    }): Observable<ApiResponse<InprogressReport[]>> {
        const formData = new FormData();
        formData.append('draw', '1');
        formData.append('start', params?.page ? ((params.page - 1) * 10).toString() : '0');
        formData.append('length', '10');
        if (params) {
            if (params.structureIds?.length) {
                formData.append('StructureIds', params.structureIds.join(','));
            }
            if (params.userIds?.length) {
                formData.append('UserIds', params.userIds.join(','));
            }
            if (params.fromDate) {
                formData.append('FromDate', params.fromDate);
            }
            if (params.toDate) {
                formData.append('ToDate', params.toDate);
            }
            if (params.isOverdue !== undefined) {
                formData.append('Overdue', params.isOverdue.toString());
            }
        }

        console.log('FormData entries:');
        formData.forEach((value, key) => {
            console.log(key, value);
        });

        // return this.http.post<ApiResponse<InprogressReport[]>>(
        //     `${this.baseUrl}/Report/ListInProgressTransfers`,
        //     formData
        // );
        return this.http.post<ApiResponse<InprogressReport[]>>(
            `${this.baseUrl}/Report/ListInProgressTransfers`,
            formData
        ).pipe(
            switchMap((response: ApiResponse<InprogressReport[]>) => {
                debugger
                const transfers = (response as ApiResponse<InprogressReport[]>).data;
                debugger
                // Fetch categories
                return this.CategoriesService.ListCategories().pipe(
                    map((categories: Category[]) => {
                        const categoryMap = categories.reduce((map, category) => {
                            map[category.id] = category.text;
                            return map;
                        }, {} as { [key: number]: string });
                        debugger
                        const transformedTransfers = transfers.map(transfer => ({
                            ...transfer,
                            categoryName: categoryMap[transfer.categoryId] || 'Unknown'
                        }));

                        return { ...response, data: transformedTransfers };
                    })
                );
            })
        );

    }

    listCompletedTransfers(params?: {
        structureIds?: number[],
        userIds?: number[],
        fromDate?: string,
        toDate?: string,
        isOverdue?: boolean,
        page?: number,
        pageSize?: number
    }): Observable<ApiResponse<InprogressReport[]>> {
        const formData = new FormData();
        formData.append('draw', '1');
        formData.append('start', params?.page ? ((params.page - 1) * 10).toString() : '0');
        formData.append('length', '10');

        if (params) {
            if (params.structureIds?.length) {
                formData.append('StructureIds', params.structureIds.join(','));
            }
            if (params.userIds?.length) {
                formData.append('UserIds', params.userIds.join(','));
            }
            if (params.fromDate) {
                formData.append('FromDate', params.fromDate);
            }
            if (params.toDate) {
                formData.append('ToDate', params.toDate);
            }
            if (params.isOverdue !== undefined) {
                formData.append('Overdue', params.isOverdue.toString());
            }
        }

        console.log('FormData entries:');
        formData.forEach((value, key) => {
            console.log(key, value);
        });

        return this.http.post<ApiResponse<InprogressReport[]>>(
            `${this.baseUrl}/Report/ListCompletedTransfers`,
            formData
        ).pipe(
            switchMap((response: ApiResponse<InprogressReport[]>) => {
                const transfers = (response as ApiResponse<InprogressReport[]>).data;
                // Fetch categories
                return this.CategoriesService.ListCategories().pipe(
                    map((categories: Category[]) => {
                        const categoryMap = categories.reduce((map, category) => {
                            map[category.id] = category.text;
                            return map;
                        }, {} as { [key: number]: string });
                        const transformedTransfers = transfers.map(transfer => ({
                            ...transfer,
                            categoryName: categoryMap[transfer.categoryId] || 'Unknown'
                        }));

                        return { ...response, data: transformedTransfers };
                    })
                );
            })
        );;
    }

    listInProgressCorrespondences(params: any): Observable<ApiResponse<InprogressCorrespondence[]>> {
        const formData = new FormData();
        formData.append('draw', '1');
        formData.append('start', params?.page ? ((params.page - 1) * params.pageSize).toString() : '0');
        formData.append('length', params?.pageSize ? params.pageSize.toString() : '10');

        if (params?.structureIds?.length) {
            formData.append('StructureIds', params.structureIds.join(','));
        }
        if (params?.userIds?.length) {
            formData.append('UserIds', params.userIds.join(','));
        }
        if (params?.fromDate) {
            formData.append('FromDate', params.fromDate);
        }
        if (params?.toDate) {
            formData.append('ToDate', params.toDate);
        }
        if (params?.isOverdue !== undefined) {
            formData.append('Overdue', params.isOverdue.toString());
        }
        if (params?.privacyId !== null && params?.privacyId !== undefined) {
            formData.append('PrivacyId', params.privacyId.toString());
        }
        if (params?.priorityId !== null && params?.priorityId !== undefined) {
            formData.append('PriorityId', params.priorityId.toString());
        }

        console.log('FormData entries:');
        formData.forEach((value, key) => {
            console.log(key, value);
        });

        return this.http.post<ApiResponse<InprogressCorrespondence[]>>(
            `${this.baseUrl}/Report/ListInProgressCorrespondences`,
            formData
        ).pipe(
            switchMap((response: ApiResponse<InprogressCorrespondence[]>) => {
                const transfers = (response as ApiResponse<InprogressCorrespondence[]>).data;
                // Fetch categories
                return this.CategoriesService.ListCategories().pipe(
                    map((categories: Category[]) => {
                        const categoryMap = categories.reduce((map, category) => {
                            map[category.id] = category.text;
                            return map;
                        }, {} as { [key: number]: string });
                        const transformedTransfers = transfers.map(transfer => ({
                            ...transfer,
                            categoryName: categoryMap[transfer.categoryId] || 'Unknown'
                        }));

                        return { ...response, data: transformedTransfers };
                    })
                );
            })
        );
    }

    listCompletedCorrespondences(params?: {
        structureIds?: number[],
        userIds?: number[],
        fromDate?: string,
        toDate?: string,
        isOverdue?: boolean,
        privacyId?: number,
        priorityId?: number,
        page?: number,
        pageSize?: number
    }): Observable<ApiResponse<InprogressCorrespondence[]>> {
        const formData = new FormData();
        formData.append('draw', '1');
        formData.append('start', params?.page ? ((params.page - 1) * 10).toString() : '0');
        formData.append('length', '10');

        if (params) {
            if (params.structureIds?.length) {
                formData.append('StructureIds', params.structureIds.join(','));
            }
            if (params.userIds?.length) {
                formData.append('UserIds', params.userIds.join(','));
            }
            if (params.fromDate) {
                formData.append('FromDate', params.fromDate);
            }
            if (params.toDate) {
                formData.append('ToDate', params.toDate);
            }
            if (params.isOverdue !== undefined) {
                formData.append('Overdue', params.isOverdue.toString());
            }
            if (params.privacyId) {
                formData.append('PrivacyId', params.privacyId.toString());
            }
            if (params.priorityId) {
                formData.append('PriorityId', params.priorityId.toString());
            }
        }

        console.log('FormData entries:');
        formData.forEach((value, key) => {
            console.log(key, value);
        });

        return this.http.post<ApiResponse<InprogressCorrespondence[]>>(
            `${this.baseUrl}/Report/ListCompletedCorrespondences`,
            formData
        ).pipe(
            switchMap((response: ApiResponse<InprogressCorrespondence[]>) => {
                const transfers = (response as ApiResponse<InprogressCorrespondence[]>).data;
                // Fetch categories
                return this.CategoriesService.ListCategories().pipe(
                    map((categories: Category[]) => {
                        const categoryMap = categories.reduce((map, category) => {
                            map[category.id] = category.text;
                            return map;
                        }, {} as { [key: number]: string });
                        const transformedTransfers = transfers.map(transfer => ({
                            ...transfer,
                            categoryName: categoryMap[transfer.categoryId] || 'Unknown'
                        }));

                        return { ...response, data: transformedTransfers };
                    })
                );
            })
        );
    }
}
