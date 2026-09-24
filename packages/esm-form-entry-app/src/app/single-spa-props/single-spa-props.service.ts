import { Injectable, OnDestroy } from '@angular/core';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { SingleSpaProps, dequeueInstanceSubject } from '../../single-spa-props';

/**
 * A utility service simplifying common interactions with the MFs single SPA props.
 *
 * Each Angular app instance created by a parcel mount gets its own service
 * instance (Angular creates a new injector per `bootstrapModule` call). The
 * service subscribes to the per-instance `ReplaySubject` that was enqueued in
 * `bootstrap.ts` just before this module was bootstrapped, so it only ever
 * sees the props that belong to *this* instance. Multiple concurrent form
 * instances therefore never overwrite each other's props.
 */
@Injectable()
export class SingleSpaPropsService implements OnDestroy {
  /**
   * The most recent {@link SingleSpaProps} value pushed to this instance.
   */
  public lastProps?: SingleSpaProps = undefined;

  private readonly subject: ReplaySubject<SingleSpaProps> | null;
  private readonly lastPropsSubscription?: Subscription;

  constructor() {
    this.subject = dequeueInstanceSubject();
    if (this.subject) {
      this.lastPropsSubscription = this.subject.subscribe((props) => (this.lastProps = props));
    }
  }

  public ngOnDestroy() {
    this.lastPropsSubscription?.unsubscribe();
  }

  /**
   * Observable of props updates for this instance. Components can subscribe
   * reactively instead of polling `lastProps`.
   */
  public get props$(): Observable<SingleSpaProps> {
    return this.subject?.asObservable() ?? new Observable<SingleSpaProps>();
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
        `The module is missing the required Single SPA property "${String(name)}". This is a development error likely caused by another microfrontend module. See the associated console log for details.`,
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
