import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SingleSpaProps, singleSpaPropsSubject } from '../../single-spa-props';

/**
 * A utility service simplifying common interactions with the MFs single SPA props.
 */
@Injectable()
export class SingleSpaPropsService implements OnDestroy {
  /**
   * The most recent {@link SingleSpaProps} value pushed to the MF module.
   */
  public lastProps?: SingleSpaProps = undefined;
  private readonly lastPropsSubscription?: Subscription;

  constructor() {
    this.lastPropsSubscription = singleSpaPropsSubject.subscribe((props) => (this.lastProps = props));
  }

  public ngOnDestroy() {
    this.lastPropsSubscription?.unsubscribe();
  }

  /**
   * Returns the last Single SPA prop with the given {@link name}.
   * Throws and logs an error if the prop is missing (i.e. if it is `undefined`).
   * @param name The name of the prop to be retrieved.
   * @returns The value of the required prop.
   */
  public getPropOrThrow<TName extends keyof SingleSpaProps>(name: TName): SingleSpaProps[TName] {
    const value = this.getProp(name);

    if (value === undefined) {
      const error = new Error(
        `The module is missing the required Single SPA property "${name}". This is a development error likely caused by another microfrontend module. See the associated console log for details.`,
      );
      console.error(error, this.lastProps);
      throw error;
    }

    return value;
  }

  /**
   * Returns the last Single SPA prop with the given {@link name} or a given fallback value if it is missing.
   * @param name The name of the prop to be retrieved.
   * @param fallback A fallback value to be returned when the prop is missing. The default is `undefined`.
   * @returns The value of the required prop or the given fallback value.
   */
  public getProp<TName extends keyof SingleSpaProps>(
    name: TName,
    fallback?: SingleSpaProps[TName],
  ): SingleSpaProps[TName] | undefined {
    return this.lastProps?.[name] ?? fallback;
  }
}
