import { TranslateLoader } from '@ngx-translate/core';
import { Observable, from } from 'rxjs';

export class JsonLoader implements TranslateLoader {
  constructor() {}
  getTranslation(lang: string): Observable<any> {
    return from(
      import(`../../../translations/${lang}.json`)
        .then((m) => m)
        .catch(async (e) => {
          console.error(`Could not find translations for locale ${lang}`, e);
          return import('../../../translations/en.json').catch();
        }),
    );
  }
}
