import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { take, map } from 'rxjs/operators';
import { Observable, Subscriber } from 'rxjs';
import { WindowRef } from '../window-ref';

@Injectable()
export class FileUploadResourceService {
  public secureUrl: SafeResourceUrl;
  constructor(private http: HttpClient, private windowRef: WindowRef, private domSanitizer: DomSanitizer) {}
  public getUrl(): string {
    return this.windowRef.nativeWindow.openmrsBase.concat('/etl-latest/etl/fileupload');
  }
  public upload(formData) {
    const url = this.getUrl();
    return this.http.post(url, formData);
  }
  public getFile(url: string, fileType?: string): Observable<any> {
    const fullUrl = this.windowRef.nativeWindow.openmrsBase.concat('/etl-latest/etl/files/') + url;
    return new Observable((observer: Subscriber<any>) => {
      let objectUrl: string = null;
      const headers = new HttpHeaders({
        Accept: 'image/png,image/jpeg,image/gif,application/pdf',
      });
      this.http
        .get(fullUrl, {
          headers,
          responseType: 'blob',
        })
        .pipe(take(1))
        .subscribe((m) => {
          if (fileType) {
            this.secureUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(m));
            observer.next(this.secureUrl);
          } else {
            objectUrl = URL.createObjectURL(m);
            observer.next(objectUrl);
          }
        });

      return () => {
        if (objectUrl) {
          URL.revokeObjectURL(null);
          objectUrl = null;
        }
      };
    });
  }
}
