import * as ngTranslate from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { FormResourceService } from '../openmrs-api/form-resource.service';

export class AmpathTranslationsLoader implements ngTranslate.TranslateLoader {
  // constructor(private translate: ngTranslate.TranslateService) {
  //   this.translate.addLangs(['en', 'fr']);
  //   //this.translate.setDefaultLang('en');

  //   // this.getTranslation().subscribe((translationsData: any) => {
  //   //   this.translate.setTranslation('en', translationsData?.en);
  //   //   this.translate.setTranslation('fr', translationsData?.fr);
  //   // });
  // }

  getTranslation(lang?: string): Observable<any> {
    // return this.formsResourceService.getFormClobDataByUuid('teste123');
    return of({ 'Patient Other ICRC ID (Prot6, ect):': 'Patient Other ICRC ID (Prot6, ect) 2:' });
  }
}
