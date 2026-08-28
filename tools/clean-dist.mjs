import { readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packagesDirectory = join(dirname(fileURLToPath(import.meta.url)), '..', 'packages');

for (const packageEntry of readdirSync(packagesDirectory, { withFileTypes: true })) {
  if (packageEntry.isDirectory()) {
    rmSync(join(packagesDirectory, packageEntry.name, 'dist'), { force: true, recursive: true });
  }
}
