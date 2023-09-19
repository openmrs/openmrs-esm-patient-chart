import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

export class JsonLoader implements TranslateLoader {
  constructor() {}
  getTranslation(lang: string): Observable<any> {
    return of(require(`../../../translations/${lang}.json`));
  }
}
