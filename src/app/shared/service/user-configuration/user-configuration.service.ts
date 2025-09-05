import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AdminEndPoint, AppRoutes } from '../../lib/api-constant';
import { ApiResponseWithoutContent } from '../../lib/constants';
import { Observable } from 'rxjs';

export interface UserAssignmentPayload {
  roleId: number;
  isBdpEmployee: boolean;
  assignedCompanies: { companyCode: string; companyName: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class UserConfigurationService {

  private httpClient = inject(HttpClient);

  updateUserConfiguration(requestBody: UserAssignmentPayload, userId: string) {
    const params = new HttpParams().set('userId', userId);
    return this.httpClient.put<ApiResponseWithoutContent>(
      AdminEndPoint.UserManagement.SAVE_UPDATE_USER_ROLE,
      requestBody,
      { params }
    );
  }

  getUserAssignedCompanies(userId: string):Observable<ApiResponseWithoutContent> {
    const params = new HttpParams().set('userId', userId);
    return this.httpClient.get<ApiResponseWithoutContent>(
      AdminEndPoint.UserManagement.GET_USER_ASSIGNED_COMPANIES,
      { params }
    );
  }
}
