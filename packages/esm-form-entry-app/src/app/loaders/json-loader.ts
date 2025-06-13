import { TranslateLoader } from '@ngx-translate/core';
import { Observable, from } from 'rxjs';

export class JsonLoader implements TranslateLoader {
  constructor() {}
  getTranslation(lang: string): Observable<any> {
    return from(import(`../../../translations/${lang}.json`));
  }
}
