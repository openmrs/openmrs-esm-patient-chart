import { Injectable } from '@angular/core';

import { ConfigObject, getConfigStore } from '@openmrs/esm-framework';
import { FormEntryConfig } from '../types';

@Injectable()
export class ConfigResourceService {
  public getConfig() {
    let formEntryConfig: ConfigObject = getConfigStore('@openmrs/esm-form-entry-app').getState()?.config;
    getConfigStore('@openmrs/esm-form-entry-app').subscribe((store) => {
      if (store.loaded && store) {
        formEntryConfig = store.config;
      }
    });

    return formEntryConfig as FormEntryConfig;
  }
}
