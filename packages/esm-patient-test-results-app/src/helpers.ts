export const makeThrottled = <T extends (...args: any[]) => any>(
  func: T,
  time = 1000
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
