import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  private translations: Record<string, string> = {};
  private currentLang = 'en';

  setLanguage(lang: string, data: any) {
    this.currentLang = lang;
    this.translations = data?.translations || {};
  }

  translate(key: string): string {
    return this.translations[key] || key;
  }

  getCurrentLang(): string {
    return this.currentLang;
  }
}
