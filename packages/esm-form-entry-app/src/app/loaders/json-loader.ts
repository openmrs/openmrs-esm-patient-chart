import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

export class JsonLoader implements TranslateLoader {
  constructor() {}

  getTranslation(lang: string): Observable<any> {
    const jsonFile = `../../../translations/${lang}.json`;

    // Check if the specified language file exists
    try {
      require.resolve(jsonFile);
    } catch (error) {
      // If the file does not exist, load the en.json file
      console.warn(`Language file ${jsonFile} not found. Loading en.json instead.`);
      return of(require(`../../../translations/en.json`));
    }

    // If the file exists, load it
    return of(require(jsonFile));
  }
}
