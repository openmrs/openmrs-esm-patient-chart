import { execSync } from 'node:child_process';

try {
  execSync(`yarn up --fixed '@openmrs/*@next' 'openmrs@next'`, {
    stdio: 'ignore',
    windowsHide: true,
  });
} catch (error) {
  console.error(`Error while updating dependencies: ${error.message ?? error}`, error);
  process.exit(1);
}

try {
  execSync(`yarn dedupe`, {
    stdio: 'ignore',
    windowsHide: true,
  });
} catch (error) {
  console.error(`Error while deduplicating dependencies: ${error.message ?? error}`, error);
  process.exit(1);
}

try {
  execSync(`yarn turbo verify`, {
    stdio: 'ignore',
    windowsHide: true,
  });
} catch (error) {
  console.error(
    `Error while running yarn verify: ${error.message ?? error}. Updates require manual intervention.`,
    error,
  );
  process.exit(1);
}
