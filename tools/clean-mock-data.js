/**
 * This is a small utility for cleaning API data in order to create mocks.
 * Copy the JSON data from the API into a file called data.json in the
 * same directory as this file. Then run this file using node. It will log
 * the result to the console. The result will be cleaned of the `links` and
 * have any `names` array reduced.
 */

const fs = require('fs');
const util = require('util');

let data;
try {
  data = fs.readFileSync('./data.json', 'utf8');
} catch (err) {
  console.error('An error occurred:', err);
}

data = JSON.parse(data).results;

data = trimExcess(data);

console.log(util.inspect(data, { showHidden: false, depth: null }));

/**
 * Recursively removes all keys that are not needed.
 *
 * @param data The object or some sub-object of it.
 * @param latestDisplay The most recent display name seen by the recursive function.
 *   Used to pick the best name from a names array. Can be undefined.
 */
function trimExcess(data, latestDisplay) {
  if (Array.isArray(data)) {
    return data.map((item) => trimExcess(item, latestDisplay));
  } else if (typeof data === 'object' && data !== null) {
    if (data['display']) {
      latestDisplay = data.display;
    }
    for (let key of Object.keys(data)) {
      if (key === 'links') {
        delete data[key];
      } else if (key === 'names' && Array.isArray(data[key])) {
        let bestName;
        if (latestDisplay) {
          bestName = data[key].find((item) => item.display === latestDisplay || item.name === latestDisplay);
        }
        data[key] = trimExcess(bestName || data[key][0]);
      } else if (data[key] === null || (Array.isArray(data[key]) && data[key].length === 0)) {
        delete data[key];
      } else if (data[key] !== null && typeof data[key] === 'object') {
        data[key] = trimExcess(data[key], latestDisplay);
      }
    }
    return data;
  } else {
    return data;
  }
}
