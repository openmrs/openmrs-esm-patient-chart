import { formatDate, parseDate } from '@openmrs/esm-framework';
import { dashboardMeta } from './dashboard.meta';

/**
 * Creates a throttled version of the given function that executes at most once per `time` ms.
 *
 * Unlike lodash throttle (which drops intermediate calls), this implementation queues
 * the LAST call made during the waiting period and executes it after the timer expires.
 * This ensures the final scroll/resize position is always reflected in the timeline view,
 * even if many events fired during the throttle window.
 *
 * @param func - The function to throttle
 * @param time - Minimum time between executions in ms (default: 1000ms)
 * @returns A throttled wrapper that accepts the same parameters as `func`
 */
export const makeThrottled = <T extends (...args: Array<unknown>) => unknown>(
  func: T,
  time = 1000,
): ((...funcArgs: Parameters<T>) => void) => {
  let waiting = false;
  let toBeExecuted = false;
  let lastArgs: Parameters<T> = null;

  const throttledFunc = (...args: Parameters<T>) => {
    if (!waiting) {
      waiting = true;
      setTimeout(() => {
        waiting = false;
        if (toBeExecuted) {
          toBeExecuted = false;
          throttledFunc(...lastArgs);
        }
      }, time);
      func(...args);
    } else {
      toBeExecuted = true;
      lastArgs = args;
    }
  };

  return throttledFunc;
};

export const testResultsBasePath = (basePath: string) => `${window.spaBase}${basePath}/${dashboardMeta.path}`;

export function formatResultDate(obsDatetime?: string) {
  return obsDatetime ? formatDate(parseDate(obsDatetime), { mode: 'standard', time: true }) : '--';
}
