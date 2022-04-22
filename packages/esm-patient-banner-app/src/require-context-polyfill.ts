/**
 * require.context is webpack magic or sugar to import individual modules in a given directory
 * There are challenges when the code runs outside of webpack - such as jest or Node.
 * One way to solve it is using bable transform-require-context plugin - but that requires depdnency on Babel
 * Below code is just a pollyfill to do the same thing that react.context does - when react.context is unavailable
 * Another approach could be to not use react.context and add the imports for traslations individually
 *
 * A good place for this pollyfil would be inside esm-utils
 */

const fs = require('fs');
const path = require('path');

export const requireContext = (base = '../translations', scanSubDirectories = false, regularExpression = /.json$/) => {
  if (typeof require.context !== 'undefined') {
    return require.context(base, scanSubDirectories, regularExpression, 'lazy');
  }

  const files = {};

  function readDirectory(directory) {
    fs.readdirSync(directory).forEach((file) => {
      const fullPath = path.resolve(directory, file);

      if (fs.statSync(fullPath).isDirectory()) {
        if (scanSubDirectories) {
          readDirectory(fullPath);
        }

        return;
      }

      if (!regularExpression.test(fullPath)) {
        return;
      }

      files[fullPath] = true;
    });
  }

  readDirectory(path.resolve(__dirname, base));

  function Module(file) {
    return require(file);
  }

  Module.keys = () => Object.keys(files);

  return Module;
};
