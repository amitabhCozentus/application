import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppRoutes } from '../../lib/api-constant';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private enbleSubscriptionDilog = new BehaviorSubject<any>([]);
  enableSubscription$ = this.enbleSubscriptionDilog.asObservable();
  constructor(protected http: HttpClient) { }

  getCustomerSubscriptionList(requestBody: any) {
    return this.http.post<any>(AppRoutes.CustomerSubscription.GET_COMPANY_SUBSCRIPTION_LIST, requestBody);
  }
  updateCustomerSubscriptionList(requestBody: any) {
    return this.http.put<any>(AppRoutes.CustomerSubscription.UPDATE_CUSTOMER_SUBSCRIPTION_LIST, requestBody);
  }
  getConfigMaster() {
    return this.http.get<any>(AppRoutes.CustomerSubscription.GET_COMPANY_CONFIG);
  }
  getCustomerSubscriptionCompanies(requestBody: any) {
    return this.http.post<any>(AppRoutes.CustomerSubscription.GET_COMPANY_SUBSCRIPTION_COMPANIES, requestBody);
  }
  updateCopySubscription(requestBody: any) {
    return this.http.post<any>(AppRoutes.CustomerSubscription.UPDATE_CUSTOMER_SUBSCRIPTION_THROUGH_COPY, requestBody);
  }

  bulkUpdateSubscriptionTier(requestBody: any) {
    return this.http.put<any>(AppRoutes.CustomerSubscription.BULK_UPDATE_CUSTOMER_SUBSCRIPTION_TIER, requestBody);
  }

}
