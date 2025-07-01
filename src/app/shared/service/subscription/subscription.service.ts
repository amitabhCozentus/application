import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private enbleSubscriptionDilog = new BehaviorSubject<any>([]);
  enableSubscription$ = this.enbleSubscriptionDilog.asObservable();
  constructor() { }
}
  