import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { RoleConfigData, ApiResponse } from '../../lib/constants';
import { environment } from '../../../../environments/environment';
import { AdminEndPoint } from '../../lib/api-constant';


export interface Role {
    id: number;
    status: 'Active' | 'Inactive';
    roleName: string;
    roleDescription: string;
    rolePrivileges: string[];
    customLanding: string;
    defaultLanding?: string;
    skin: string;
    createdBy: string;
    createdOn: string;
    updatedBy: string;
    updatedOn: string;
}

export interface PagedResult<T> {
    data: T[];
    total: number;
}

// API Response interfaces for specific endpoints
export interface SkinData {
    roleType: {
        id: number;
        key: string;
        name: string;
    };
    skins: Array<{
        id: number;
        key: string;
        name: string;
    }>;
}

export interface PrivilegeData {
    categoryId: number;
    categoryName: string;
    categoryKey: string;
    features: Array<{
        featureId: number;
        featureName: string;
        featureKey: string;
        privileges: Array<{
            privilegeId: number;
            privilegeName: string;
            privilegeKey: string;
            mapCatFeatPrivId: number;
            isSelected: boolean;
        }>;
    }>;
}

export interface LandingPageData {
    id: number;
    key: string;
    name: string;
}

// Standardized API request payload interface
interface ApiRequestPayload {
    pagination: {
        page: number;
        size: number;
    };
    searchFilter: {
        searchText?: string;
        columns?: string[];
    };
    columns: Array<{
        columnName: string;
        filter?: string;
        sort?: string;
    }>;
    sortFieldValidator?: {
        validSortFields: string[];
    };
}

@Injectable({ providedIn: 'root' })
export class RoleService {
    private http = inject(HttpClient);
    private apiUrl = environment.baseurl + AdminEndPoint.RoleManagement.ROLE_LIST;

    /** Fetch paged + filtered roles from API */
    getActiveRoles(page: number, size: number, search: string): Observable<PagedResult<RoleConfigData>> {
        // Build standardized request payload according to API spec
        const requestPayload: ApiRequestPayload = {
            pagination: {
                page: page,
                size: size
            },
            searchFilter: {},
            columns: []
        };

        return this.http
            .post<ApiResponse>(this.apiUrl, requestPayload)
            .pipe(
                map(res => {
                    if (!res?.success || !res?.data) {
                        return { data: [], total: 0 };
                    }

                    const roles: RoleConfigData[] = res.data.content.map(item => {
                        // Format privileges showing only features and privileges (no category)
                        const privilegesList: string[] = [];

                        item.privilegeHierarchy?.forEach(category => {
                            category.features?.forEach(feature => {
                                const selectedPrivileges = feature.privileges?.filter(p => p.isSelected) || [];
                                if (selectedPrivileges.length > 0) {
                                    // Format as: Feature (Privilege1, Privilege2)
                                    const privilegeNames = selectedPrivileges.map(p => p.privilegeName).join(', ');
                                    privilegesList.push(`${feature.featureName} (${privilegeNames})`);
                                }
                            });
                        });

                        return {
                            id: item.id,
                            status: item.isActive ? 'Active' : 'Inactive',
                            roleName: item.name,
                            roleDescription: item.description || '',
                            rolePrivileges: privilegesList,
                            customLanding: item.landingPage ? 'Yes' : 'No',
                            defaultLanding: item.landingPage?.name || null,
                            roleType: item.roleType?.name || '',
                            skin: item.skinConfigs?.map(s => s.name).join(', ') || null,
                            createdBy: item.createdBy || '',
                            createdOn: item.createdOn || '',
                            updatedBy: item.updatedBy || '',
                            updatedOn: item.updatedOn || ''
                        } as RoleConfigData;
                    });
                    return {
                        data: roles,
                        total: res.data.totalElements || 0
                    };
                }),
                catchError(this.handleError<PagedResult<RoleConfigData>>('getActiveRoles', { data: [], total: 0 }))
            );
    }

    /** Fetch skins by role type from dedicated API */
    getSkins(): Observable<SkinData[]> {
        const apiUrl = environment.baseurl + AdminEndPoint.RoleManagement.SKINS;
        return this.http.get<any>(apiUrl)
            .pipe(
                map(response => {
                    if (response?.success && response?.data) {
                        return response.data as SkinData[];
                    }
                    return [];
                }),
                catchError(this.handleError<SkinData[]>('getSkins', []))
            );
    }

    /** Fetch privilege hierarchy from dedicated API */
    getPrivilegeHierarchy(): Observable<PrivilegeData[]> {
        const apiUrl = environment.baseurl + AdminEndPoint.RoleManagement.PRIVILEGE_HIERARCHY;
        return this.http.get<any>(apiUrl)
            .pipe(
                map(response => {
                    if (response?.success && response?.data) {
                        return response.data as PrivilegeData[];
                    }
                    return [];
                }),
                catchError(this.handleError<PrivilegeData[]>('getPrivilegeHierarchy', []))
            );
    }

    /** Fetch landing pages from dedicated API */
    getLandingPages(): Observable<LandingPageData[]> {
        const apiUrl = environment.baseurl + AdminEndPoint.RoleManagement.LANDING_PAGES;
        return this.http.get<any>(apiUrl)
            .pipe(
                map(response => {
                    if (response?.success && response?.data) {
                        return response.data as LandingPageData[];
                    }
                    return [];
                }),
                catchError(this.handleError<LandingPageData[]>('getLandingPages', []))
            );
    }

    /** Fetch unique skin options from dedicated API */
    getConfigOptions(): Observable<{ skins: string[]; defaultLandings: string[] }> {
        return this.getSkins().pipe(
            map(skinData => {
                const skins = skinData.flatMap(roleType =>
                    roleType.skins.map(skin => skin.name)
                );
                return {
                    skins: Array.from(new Set(skins)),
                    defaultLandings: [] as string[] // Will be populated by getLandingPages()
                };
            }),
            catchError(this.handleError<{ skins: string[]; defaultLandings: string[] }>('getConfigOptions', { skins: [], defaultLandings: [] }))
        );
    }

    /** Fetch unique privilege options from dedicated API */
    getPrivilegeOptions(): Observable<string[]> {
        return this.getPrivilegeHierarchy().pipe(
            map(privilegeData => {
                const privileges = privilegeData.flatMap(category =>
                    category.features.flatMap(feature =>
                        feature.privileges.map(privilege => privilege.privilegeName)
                    )
                );
                return Array.from(new Set(privileges));
            }),
            catchError(this.handleError<string[]>('getPrivilegeOptions', []))
        );
    }

    /** Enhanced search functionality with advanced filtering */
    searchRoles(searchCriteria: {
        searchText?: string;
        status?: string;
        roleType?: string;
        columns?: string[];
        page?: number;
        size?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Observable<PagedResult<RoleConfigData>> {
        const payload: ApiRequestPayload = {
            pagination: {
                page: searchCriteria.page || 1,
                size: searchCriteria.size || 10
            },
            searchFilter: {
                searchText: searchCriteria.searchText || '',
                columns: searchCriteria.columns || ['name', 'description', 'roleType']
            },
            columns: [
                {
                    columnName: 'name',
                    sort: searchCriteria.sortBy === 'name' ? searchCriteria.sortOrder : undefined
                },
                {
                    columnName: 'description',
                    sort: searchCriteria.sortBy === 'description' ? searchCriteria.sortOrder : undefined
                },
                {
                    columnName: 'isActive',
                    filter: searchCriteria.status === 'Active' ? 'true' : searchCriteria.status === 'Inactive' ? 'false' : undefined,
                    sort: searchCriteria.sortBy === 'status' ? searchCriteria.sortOrder : undefined
                },
                {
                    columnName: 'roleType',
                    filter: searchCriteria.roleType || undefined,
                    sort: searchCriteria.sortBy === 'roleType' ? searchCriteria.sortOrder : undefined
                },
                {
                    columnName: 'createdOn',
                    sort: searchCriteria.sortBy === 'createdOn' ? searchCriteria.sortOrder : undefined
                },
                {
                    columnName: 'updatedOn',
                    sort: searchCriteria.sortBy === 'updatedOn' ? searchCriteria.sortOrder : undefined
                }
            ],
            sortFieldValidator: {
                validSortFields: ['name', 'description', 'isActive', 'roleType', 'createdOn', 'updatedOn']
            }
        };

        return this.http.post<ApiResponse>(this.apiUrl, payload)
            .pipe(
                map(res => {
                    if (!res?.success || !res?.data) {
                        return { data: [], total: 0 };
                    }

                    const roles: RoleConfigData[] = res.data.content.map(item => {
                        // Format privileges showing only features and privileges (no category)
                        const privilegesList: string[] = [];

                        item.privilegeHierarchy?.forEach(category => {
                            category.features?.forEach(feature => {
                                const selectedPrivileges = feature.privileges?.filter(p => p.isSelected) || [];
                                if (selectedPrivileges.length > 0) {
                                    // Format as: Feature (Privilege1, Privilege2)
                                    const privilegeNames = selectedPrivileges.map(p => p.privilegeName).join(', ');
                                    privilegesList.push(`${feature.featureName} (${privilegeNames})`);
                                }
                            });
                        });

                        return {
                            id: item.id,
                            status: item.isActive ? 'Active' : 'Inactive',
                            roleName: item.name,
                            roleDescription: item.description || '',
                            rolePrivileges: privilegesList,
                            customLanding: item.landingPage ? 'Yes' : 'No',
                            defaultLanding: item.landingPage?.name || null,
                            roleType: item.roleType?.name || '',
                            skin: item.skinConfigs?.map(s => s.name).join(', ') || null,
                            createdBy: item.createdBy || '',
                            createdOn: item.createdOn || '',
                            updatedBy: item.updatedBy || '',
                            updatedOn: item.updatedOn || ''
                        } as RoleConfigData;
                    });

                    return {
                        data: roles,
                        total: res.data.totalElements || 0
                    };
                }),
                catchError(this.handleError<PagedResult<RoleConfigData>>('searchRoles', { data: [], total: 0 }))
            );
    }

    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.error(`RoleService ${operation} failed:`, error);

            // Log detailed error information for debugging
            if (error?.error?.message) {
                console.error('Server error message:', error.error.message);
            }
            if (error?.status) {
                console.error('HTTP status:', error.status);
            }
            if (error?.url) {
                console.error('Failed URL:', error.url);
            }

            // Return result or throw error based on context
            if (result !== undefined) {
                return of(result as T);
            }

            // Re-throw error for operations that expect specific error handling
            throw error;
        };
    }
}
