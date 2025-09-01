import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, Event, NavigationEnd, NavigationStart, NavigationCancel } from '@angular/router';
import { CommonService } from './common/common.service';
import { FilterService } from 'primeng/api';
import {AppRoutes}  from '../../shared/lib/api-constant'


@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private currentNav: INavigationData = { route: '', routeType: '' };
  private currentNavPromise = new BehaviorSubject<INavigationData>(this.currentNav);
  public $currentNav = this.currentNavPromise.asObservable();
  private commonService: CommonService = inject(CommonService);
  private router: Router = inject(Router);
  private _availableRoutes: any;

  get availableRoutes() {
    if (!this._availableRoutes) {
      this._availableRoutes = {
        HOME: this.commonService.getRoute({ route: AppRoutes.User.HOME, type: 'User' }),
      }
      return this._availableRoutes;
    }
  }

    constructor() {
      this.router.events.subscribe((event: Event) => {
        if (event instanceof NavigationEnd) {
          let url = this.router.url;

          if (url) {
            const navData: INavigationData = {
              route: url,
              routeType: this.availableRoutes.HOME
            }
            switch (navData.route) {
              case this.availableRoutes.HOME: {
                navData.routeType = AppRoutes.User.HOME;
                break;
              }
            }
            this.currentNav = navData;
            this.currentNavPromise.next(navData);
          }
        }
      });

    }
  }

export interface INavigationData {
  route: string;
  routeType: string;
}
