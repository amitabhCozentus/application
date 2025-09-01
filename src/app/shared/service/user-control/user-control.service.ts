import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, ApiResponseWithoutContent } from '../../lib/constants';
import { ApiRequestBody } from '../../lib/api-request';
import { AdminEndPoint } from '../../lib/api-constant';
import { userInfo } from '../../../pages/user-managment/user-control/user-control.component';
import { UserType } from '../../../pages/user-managment/user-configuration/user-configuration.component';
import { TreeNode } from 'primeng/api';
@Injectable({
  providedIn: 'root'
})
export class UserControlService {

  private httpClient = inject(HttpClient);

  private existingUsertableHeaders: any[] = [
    { field: 'userName', header: 'Name' },
    { field: 'userId', header: 'User Email Id' },
    { field: 'userType', header: 'User Type' },
    { field: 'companies', header: 'Company Name' },
    { field: 'roleGranted', header: 'Role Granted' }
  ];
  private pendingUsertableHeaders: any[] = [
    { field: 'userName', header: 'Name' },
    { field: 'userId', header: 'User Email Id' },
    { field: 'userType', header: 'User Type' },
    { field: 'companies', header: 'Company Name' },
    { field: 'roleGranted', header: 'Role Granted' }
  ];


  getUsersList(payload: Partial<ApiRequestBody>): Observable<ApiResponse<userInfo>> {
    return this.httpClient.post<ApiResponse<userInfo>>(AdminEndPoint.UserManagement.GET_USER_LIST, payload);
  }

  getCompanyList<T>(payload: Partial<ApiRequestBody>): Observable<ApiResponse<TreeNode>> {
    return this.httpClient.post<ApiResponse<TreeNode>>(AdminEndPoint.UserManagement.GET_COMPANY_LIST, payload);
  }

  getRoleList(): Observable<ApiResponseWithoutContent> {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('active', 'true');
    return this.httpClient.get<ApiResponseWithoutContent>(AdminEndPoint.UserManagement.GET_USER_ROLES, {params: httpParams});
  }

  getTableHeaders(activeIndex: any) {
    if (activeIndex)
      return this.existingUsertableHeaders
    else
      return this.pendingUsertableHeaders
  }

}
