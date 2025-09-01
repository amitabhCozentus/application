import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { RoleConfigData, ApiResponse, ApiSkinConfig, ApiRole, ApiRequestPayload, ColumnFilterDescriptor, PagedResult, toPagedResult, createServiceErrorHandler, createEmptyPagedResult } from '../../lib/constants';
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

export interface RoleCreatePayload {
    name: string;
    description: string;
    isActive: boolean;
    customLanding: boolean;
    landingPageConfigId?: number;
    roleTypeConfigId: number;
    skinConfigIds: number[];
    privilegeIds: number[];
    createdById: number;
    updatedById: number;
  }

  export interface RoleUpdatePayload extends RoleCreatePayload {
    id: number;
  }

  export interface RoleTypeData {
    id: number;
    key: string;
    name: string;
  }

  export interface SkinData {
    roleType: RoleTypeData;
    skins: ApiSkinConfig[];
  }

@Injectable({ providedIn: 'root' })
export class RoleService {
    private http = inject(HttpClient);
    private handleError = createServiceErrorHandler('RoleService');
    private readonly roleListApiUrl = AdminEndPoint.RoleManagement.ROLE_LIST;
    private readonly saveUpdateRoleApiUrl = AdminEndPoint.RoleManagement.SAVE_UPDATE_ROLE_MANAGEMENT;
    private readonly skinApiUrl = AdminEndPoint.RoleManagement.SKINS;
    private readonly privilegeHierarchyApiUrl = AdminEndPoint.RoleManagement.PRIVILEGE_HIERARCHY;
    private readonly landingPagesApiUrl = AdminEndPoint.RoleManagement.LANDING_PAGES;

    private readonly SEARCHABLE_COLUMNS = ["name", "description"];

    /**
     * Fetch paged + filtered roles from API using flexible operator-based filters.
     * - searchTerm applies a global search (API decides target columns when searchFilter.columns omitted).
     * - columnFilters lets callers pass per-column filter/sort using operator strings (cnt, sw, eq, gt, dgte, dbetween, in, etc.).
     */
    getActiveRoles(
        page: number,
        size: number,
        searchTerm: string,
        columnFilters: ColumnFilterDescriptor[] = []
    ): Observable<PagedResult<RoleConfigData>> {
        // Build standardized request payload according to API spec
        const requestPayload: ApiRequestPayload = {
            pagination: { page, size },
            searchFilter: {
                searchText: searchTerm?.trim() || '',
                columns: [...this.SEARCHABLE_COLUMNS]
            },
            columns: columnFilters.map(cf => ({
                columnName: cf.columnName,
                filter: cf.filter,
                sort: cf.sort
            })),
        };

        return this.http
            .post<ApiResponse<ApiRole>>(this.roleListApiUrl, requestPayload)
            .pipe(
                map(res => {
                    const page = toPagedResult<ApiRole>(res);
                    const roles: RoleConfigData[] = page.data.map(item => {
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
                    return { data: roles, total: page.total };
                }),
                catchError(this.handleError<PagedResult<RoleConfigData>>('getActiveRoles', createEmptyPagedResult<RoleConfigData>()))
            );
    }

    /** Fetch skins by role type from dedicated API */
    getSkins(): Observable<SkinData[]> {
        return this.http.get<any>(this.skinApiUrl)
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
        return this.http.get<any>(this.privilegeHierarchyApiUrl)
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
        return this.http.get<any>(this.landingPagesApiUrl)
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
            ]
        };

        return this.http.post<ApiResponse<ApiRole>>(this.roleListApiUrl, payload)
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
                        total: res.data?.totalElements || 0
                    };
                }),
                catchError(this.handleError<PagedResult<RoleConfigData>>('searchRoles', { data: [], total: 0 }))
            );
    }

    /** Create a new role using dedicated API */
    createRole(roleData: RoleCreatePayload): Observable<ApiResponse<ApiRole>> {
        return this.http.post<ApiResponse<ApiRole>>(this.saveUpdateRoleApiUrl, roleData).pipe(
            map(response => {
                return response;
            }),
            catchError(error => {
                return this.handleError<ApiResponse<ApiRole>>('createRole', this.getDefaultErrorResponse())(error);
            })
        );
    }

    /** Update an existing role using dedicated API */
    updateRole(roleData: RoleUpdatePayload): Observable<ApiResponse<ApiRole>> {
        const url = `${this.saveUpdateRoleApiUrl}/${roleData.id}`;

        return this.http.put<ApiResponse<ApiRole>>(url, roleData).pipe(
            map(response => {
                return response;
            }),
            catchError(error => this.handleError<ApiResponse<ApiRole>>('updateRole', this.getDefaultErrorResponse())(error))
        );
    }

    private getDefaultErrorResponse(): ApiResponse<ApiRole> {
        return {
            success: false,
            data: { content: [], page: 0, size: 0, totalElements: 0, totalPages: 0, last: true },
            timestamp: new Date().toISOString()
        } as any;
    }
}
