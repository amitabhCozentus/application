import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {  AppRoutes } from "../../../../app/shared/lib/api-constant";

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(protected router: Router) { }

  navigateRouteWithState(route: any) {
    let rootPath: string = '/';
    if (route.type && route.type == 'Manager') {
      rootPath = rootPath + "/" + route.route;
    }
    if (route.type && route.type == 'User') {
      rootPath = rootPath +  "/" + route.route;
    }
    const navigationExtras = {
      state: route.routeData ? route.routeData : {}
    };
    if (route?.routeData) {
      this.router.navigate(
        [rootPath], navigationExtras 
      );
    }
  }
}
