import { NgModule } from '@angular/core';
import { NgxFileUploaderComponent } from '../../node_modules/@openmrs/ngx-file-uploader';

export { NgxFileUploaderComponent };

@NgModule({
  imports: [NgxFileUploaderComponent],
  exports: [NgxFileUploaderComponent],
})
export class NgxFileUploaderModule {}
