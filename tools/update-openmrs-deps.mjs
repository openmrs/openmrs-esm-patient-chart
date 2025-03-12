import { execSync } from 'node:child_process';

/** @type {Buffer} */
let output;
try {
  output = execSync("yarn outdated --format=json '@openmrs/*' 'openmrs'", {
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
} catch (error) {
  console.error(`Error while detecting outdated versions: ${error.message ?? error}`, error);
  process.exit(1);
}

const outdated = JSON.parse(output.toString('utf8'));
const outdatedDeps = [];

for (const outdatedDep of outdated) {
  if (outdatedDep.name) {
    outdatedDeps.push(outdatedDep.name);
  }
}

if (outdatedDeps.length > 0) {
  try {
    execSync(`yarn up --fixed ${outdatedDeps.map((dep) => `${dep}@next`).join(' ')}`, {
      stdio: 'ignore',
      windowsHide: true,
    });
  } catch (error) {
    console.error(`Error while updating dependencies: ${error.message ?? error}`, error);
    process.exit(1);
  }
}
