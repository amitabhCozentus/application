import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {  AppRoutes } from "../../../../app/shared/lib/api-constant";

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(protected router: Router) { }


  public getRoute(settings: any = {}) {
    let rootPath: string = '/';
    if (settings.type == 'User') {
      rootPath = rootPath + AppRoutes.User.ROOT;
    }
    if (settings.type == 'Manager') {
      rootPath = rootPath + AppRoutes.Manager.ROOT;
    }
    if (settings.type) {
      rootPath = rootPath + "/" + settings.route;
    } else {
      rootPath = rootPath + settings.route;
    }
    return rootPath;
  }

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
