import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
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

@Injectable({ providedIn: 'root' })
export class RoleService {
  // Base URL for roles API
  private apiUrl = environment.baseurl + AdminEndPoint.RoleManagement.ROLE_LIST;

  constructor(private http: HttpClient) {}

  /** Fetch paged + filtered roles from API */
  /** Fetch paged + filtered roles from API */
  getActiveRoles(page: number, size: number, search = ''): Observable<PagedResult<RoleConfigData>> {
    // Build request payload according to API spec
    const requestBody: any = {
      pagination: { page, size },
      columns: [ { columnName: 'name', sort: 'asc' } ]
    };
    // Optionally include search filter
    if (search.length >= 3) {
      requestBody.search = search;
    }
    return this.http
      .post<ApiResponse>(this.apiUrl, requestBody)
      .pipe(
        map(res => {
          const roles: RoleConfigData[] = res.data.content.map(item => {
            // collect selected privileges from nested hierarchy
            const privileges = item.privilegeHierarchy
              .flatMap(cat => cat.features)
              .flatMap(feat => feat.privileges)
              .filter(p => p.isSelected)
              .map(p => p.privilegeName);
            return {
              id: item.id,
              status: item.isActive ? 'Active' : 'Inactive',
              roleName: item.name,
              roleDescription: item.description,
              rolePrivileges: privileges,
              customLanding: item.landingPage ? 'Yes' : 'No',
              defaultLanding: item.landingPage?.name || null,
              roleType: item.roleType.name,
              skin: item.skinConfigs.map(s => s.name).join(', ') || null,
              createdBy: item.createdBy || '',
              createdOn: item.createdOn || '',
              updatedBy: item.updatedBy || '',
              updatedOn: item.updatedOn || ''
            } as RoleConfigData;
          });
          return { data: roles, total: res.data.pagination.totalElements };
        })
      );
  }

  /** Fetch unique skin and default landing options from API data */
  getConfigOptions(): Observable<{ skins: string[]; defaultLandings: string[] }> {
    return this.getActiveRoles(0, 1000).pipe(
      map(res => {
        // filter out null or empty strings
        const skinsRaw = res.data.map(r => r.skin).filter(s => !!s);
        const skins = Array.from(new Set(skinsRaw)) as string[];
        const landsRaw = res.data.map(r => r.defaultLanding).filter(l => !!l);
        const defaultLandings = Array.from(new Set(landsRaw)) as string[];
        return { skins, defaultLandings };
      })
    );
  }

  /** Fetch unique privilege options from API data */
  getPrivilegeOptions(): Observable<string[]> {
    return this.getActiveRoles(0, 1000).pipe(
      map(res => {
        const privRaw = res.data.flatMap(r => r.rolePrivileges || []);
        return Array.from(new Set(privRaw)) as string[];
      })
    );
  }
}
