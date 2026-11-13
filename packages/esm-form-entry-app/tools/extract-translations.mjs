// Rebuilds translations/en.json from two sources:
// - the English strings @openmrs/ngx-formentry ships for the keys the form engine uses
// - the literal keys this app passes to the `translate` pipe or `TranslateService.instant` in src/app
// Engine keys take the engine's string. App keys keep the string already in en.json.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const appDir = join(packageRoot, 'src', 'app');
const enPath = join(packageRoot, 'translations', 'en.json');

const keyPatterns = [/['"]([\w.]+)['"]\s*\|\s*translate\b/g, /\.instant\(\s*['"]([\w.]+)['"]/g];

function listSourceFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return listSourceFiles(path);
    }
    return /(?<!\.spec)\.ts$|\.html$/.test(entry.name) ? [path] : [];
  });
}

let engineStrings;
try {
  engineStrings = require('@openmrs/ngx-formentry/translations/en.json');
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND' || error.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED') {
    console.warn(
      'The installed @openmrs/ngx-formentry does not ship translations/en.json. Skipping, translations/en.json is unchanged.',
    );
    process.exit(0);
  }
  throw error;
}

const appKeys = new Set(
  listSourceFiles(appDir).flatMap((file) => {
    const source = readFileSync(file, 'utf8');
    return keyPatterns.flatMap((pattern) => [...source.matchAll(pattern)].map((match) => match[1]));
  }),
);

const existingOutput = readFileSync(enPath, 'utf8');
const existingStrings = JSON.parse(existingOutput);
const strings = { ...engineStrings };
const missingKeys = [];

for (const key of appKeys) {
  if (key in strings) {
    continue;
  }
  if (key in existingStrings) {
    strings[key] = existingStrings[key];
  } else {
    missingKeys.push(key);
  }
}

if (missingKeys.length) {
  console.error(`Add English strings for these keys to translations/en.json: ${missingKeys.sort().join(', ')}`);
  process.exit(1);
}

const sortedStrings = Object.fromEntries(
  Object.keys(strings)
    .sort()
    .map((key) => [key, strings[key]]),
);
const output = JSON.stringify(sortedStrings, null, 2) + '\n';

if (output !== existingOutput) {
  writeFileSync(enPath, output);
}
