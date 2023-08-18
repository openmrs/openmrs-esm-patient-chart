import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LOCALE_ID, NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { EmptyRouteComponent } from './empty-route/empty-route.component';
import { FeWrapperComponent } from './fe-wrapper/fe-wrapper.component';
import { FormEntryModule } from '@openmrs/ngx-formentry';

import { ReactiveFormsModule } from '@angular/forms';
import { OpenmrsApiModule } from './openmrs-api/openmrs-api.module';
import { FormSchemaService } from './form-schema/form-schema.service';
import { LocalStorageService } from './local-storage/local-storage.service';
import { FormDataSourceService } from './form-data-source/form-data-source.service';
import { FormSubmissionService } from './form-submission/form-submission.service';
import { MonthlyScheduleResourceService } from './services/monthly-scheduled-resource.service';
import { ConfigResourceService } from './services/config-resource.service';
import { LoaderComponent } from './loader/loader.component';
import { SingleSpaPropsService } from './single-spa-props/single-spa-props.service';
import { FormCreationService } from './form-creation/form-creation.service';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { ProgramResourceService } from './openmrs-api/program-resource.service';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
registerLocaleData(localeFr);

@NgModule({
  declarations: [AppComponent, EmptyRouteComponent, FeWrapperComponent, LoaderComponent],
  imports: [
    BrowserModule,
    TranslateModule.forRoot({
      isolate: false,
    }),
    FormEntryModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    OpenmrsApiModule,
  ],
  providers: [
    FormSchemaService,
    LocalStorageService,
    FormDataSourceService,
    FormSubmissionService,
    FormCreationService,
    MonthlyScheduleResourceService,
    ConfigResourceService,
    SingleSpaPropsService,
    TranslateService,
    TranslateStore,
    {
      provide: LOCALE_ID,
      useValue: (window as any).i18next.language.toLowerCase() ? (window as any).i18next.language.toLowerCase() : 'en',
    },
    ProgramResourceService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
