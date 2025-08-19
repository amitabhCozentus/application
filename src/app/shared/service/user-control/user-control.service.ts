import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, DataItem } from '../../model/user-management.model';
import { ApiRequestBody } from '../../lib/api-request';

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


  getUsersList(payload: Partial<ApiRequestBody>): Observable<ApiResponse> {
    return this.httpClient.post<ApiResponse>("http://localhost:8080/user-management/v1/company-tree", payload);
  }


  getTableHeaders(activeIndex: any) {
    if (activeIndex)
      return this.existingUsertableHeaders
    else
      return this.pendingUsertableHeaders
  }

}
