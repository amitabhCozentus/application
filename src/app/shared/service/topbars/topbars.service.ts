import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class TopbarsService {

  constructor(private httpClient: HttpClient) { }

  getFrenchItemTranslation(item: string): Observable<any> {
    return this.httpClient.get(`https://private-1cf213-itt.apiary-mock.com/localization/fr`);
  }
  getEnglishItemTranslation(item: string): Observable<any> {
    return this.httpClient.get(`https://private-1cf213-itt.apiary-mock.com/localization/en`);
  }
}
