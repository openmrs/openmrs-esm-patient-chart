import { enableProdMode, NgZone } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { singleSpaAngular, getSingleSpaExtraProviders } from 'single-spa-angular';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { enqueueContainerElement, enqueueInstanceSubject, SingleSpaProps } from './single-spa-props';

if (environment.production) {
  enableProdMode();
}

/**
 * Creates a fresh set of single-spa lifecycle functions for one parcel instance.
 *
 * Each call produces its own `options` object inside single-spa-angular, so
 * `options.bootstrappedNgModuleRefOrAppRef` is never shared between instances.
 * Without this, a second mount would overwrite the first mount's module ref and
 * unmounting either parcel would destroy the wrong Angular application.
 */
export function createLifecycles() {
  return singleSpaAngular({
    bootstrapFunction: async (singleSpaProps) => {
      // Enqueue props and container element before Angular starts instantiating
      // services. ngDoBootstrap dequeues the element and calls appRef.bootstrap
      // synchronously during module initialisation, guaranteeing that
      // AppComponent is always attached to the correct DOM element.
      enqueueInstanceSubject(singleSpaProps as SingleSpaProps);
      const containerElement = (singleSpaProps as any).domElement as HTMLElement | undefined;
      enqueueContainerElement(containerElement ?? null);

      return await platformBrowserDynamic(getSingleSpaExtraProviders()).bootstrapModule(AppModule);
    },
    template: '<my-app-root />',
    NgZone,
  });
}
