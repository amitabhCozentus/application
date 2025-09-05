import { inject, Inject, Injectable } from '@angular/core';
import { AppEndPoints } from '../../../shared/lib/api-constant';
import { HttpClient } from '@angular/common/http';
import { kpiRequestBody } from 'src/app/pages/home/home/home.component';
import { MapRequestBody } from '../../../pages/home/home/home.component';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  private httpClient = inject(HttpClient);

  constructor() { }

  getMapdata(body: MapRequestBody): any {
    return this.httpClient.post(AppEndPoints.Home.GET_COUNTRY_LIST, body);
  }

  getKpisData(body: typeof kpiRequestBody): any {
    return this.httpClient.post(AppEndPoints.Home.GET_KPIS_DATA, body);
  }
}

