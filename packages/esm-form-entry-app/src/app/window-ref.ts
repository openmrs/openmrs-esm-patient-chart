import { Injectable } from '@angular/core';
import { restBaseUrl } from '@openmrs/esm-framework';

function _window() {
  // return the global native browser window object
  return window;
}

@Injectable({
  providedIn: 'root',
})
export class WindowRef {
  get nativeWindow() {
    return _window();
  }

  get openmrsRestBase(): string {
    return this.nativeWindow.openmrsBase + restBaseUrl;
  }
}
