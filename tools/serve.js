const { spawn } = require('child_process');
const path = require('path');

// Get packages from command line arguments
const packages = process.argv.slice(2);

if (packages.length === 0) {
  console.log('Usage: yarn serve <package1> <package2> ...');
  console.log('Example: yarn serve esm-patient-vitals-app esm-patient-notes-app');
  process.exit(1);
}

console.log(`Starting serve for packages: ${packages.join(', ')}`);

// Start serve for each package with sequential ports starting from 8081
const processes = packages.map((pkg, index) => {
  const packagePath = path.join(__dirname, '..', 'packages', pkg);
  const port = 8081 + index;
  
  console.log(`Starting serve for ${pkg} on port ${port}...`);
  
  const child = spawn('yarn', ['serve', '--port', port.toString()], {
    cwd: packagePath,
    stdio: 'inherit',
    shell: true
  });
  
  child.on('error', (error) => {
    console.error(`Error starting ${pkg}:`, error);
  });
  
  child.on('close', (code) => {
    console.log(`${pkg} serve process exited with code ${code}`);
  });
  
  return child;
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down all serve processes...');
  processes.forEach(child => child.kill('SIGINT'));
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down all serve processes...');
  processes.forEach(child => child.kill('SIGTERM'));
  process.exit(0);
});