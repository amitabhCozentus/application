import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserEndPoint } from '../../lib/api-constant';

const BASE_URL = "http://localhost:8080/api/v1/";
@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private enbleSubscriptionDilog = new BehaviorSubject<any>([]);
  enableSubscription$ = this.enbleSubscriptionDilog.asObservable();
  constructor(protected http: HttpClient) { }

  getCustomerSubscriptionList(requestBody: any) {
    const endpoint = BASE_URL + UserEndPoint.CustomerSubscription.GET_COMPANY_SUBSCRIPTION_LIST;
    return this.http.post<any>(endpoint, requestBody);
  }
  updateCustomerSubscriptionList(requestBody: any) {
    const endpoint = BASE_URL + UserEndPoint.CustomerSubscription.UPDATE_CUSTOMER_SUBSCRIPTION_LIST;
    return this.http.put<any>(endpoint, requestBody);
  }
  getConfigMaster() {
    const endpoint = BASE_URL + UserEndPoint.CustomerSubscription.GET_COMPANY_CONFIG;
    return this.http.get<any>(endpoint);
  }

}
  