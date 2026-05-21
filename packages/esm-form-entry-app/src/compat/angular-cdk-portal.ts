import { Injector, type ProviderToken } from '@angular/core';

export {
  BasePortalOutlet,
  CdkPortal,
  CdkPortalOutlet,
  ComponentPortal,
  DomPortal,
  DomPortalOutlet,
  Portal,
  PortalHostDirective,
  PortalModule,
  TemplatePortal,
  TemplatePortalDirective,
} from '../../node_modules/@angular/cdk/fesm2022/portal.mjs';

export class PortalInjector implements Injector {
  constructor(
    private parentInjector: Injector,
    private customTokens: WeakMap<ProviderToken<unknown>, unknown>,
  ) {}

  get<T>(token: ProviderToken<T>, notFoundValue?: T): T {
    if (this.customTokens.has(token)) {
      return this.customTokens.get(token) as T;
    }

    return this.parentInjector.get(token, notFoundValue);
  }
}
