/**
 * require.context is webpack magic or sugar to import individual modules in a given directory
 * There are challenges when the code runs outside of webpack - such as jest or Node.
 * One way to solve it is using bable transform-require-context plugin - but that requires depdnency on Babel
 * Below code is just externalizing react.context and returning empty funciton when react.context is unavailable
 * Another approach could be to not use react.context and add the imports for traslations individually
 *
 * A good place for this function would be inside esm-utils
 */

export const requireContext = (base = '../translations', scanSubDirectories = false, regularExpression = /.json$/) => {
  if (typeof require.context !== 'undefined') {
    return require.context(base, scanSubDirectories, regularExpression, 'lazy');
  }

  return () => {};
};
