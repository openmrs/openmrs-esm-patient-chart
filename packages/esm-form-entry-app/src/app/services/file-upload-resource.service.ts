import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { take, map } from 'rxjs/operators';
import { Observable, Subscriber } from 'rxjs';
import { WindowRef } from '../window-ref';
import { ConfigResourceService } from './config-resource.service';

@Injectable()
export class FileUploadResourceService {
  public secureUrl: SafeResourceUrl;
  constructor(
    private http: HttpClient,
    private windowRef: WindowRef,
    private domSanitizer: DomSanitizer,
    private configResource: ConfigResourceService,
  ) {}
  public getUrl(): string {
    const openmrsBase: string = this.windowRef.nativeWindow.openmrsBase;
    const etlBaseUrl = this.configResource.getConfig().fileUploaderResourceUrl;
    return openmrsBase.concat(etlBaseUrl);
  }
  public upload(formData) {
    const url = this.getUrl().concat('/fileupload');
    return this.http.post(url, formData);
  }
  public getFile(url: string, fileType?: string): Observable<any> {
    const fullUrl = this.getUrl().concat('/files/') + url;
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
