// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const fs = require('fs');

const LINUX_CHROME_PATHS = [
  '/snap/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
];

function findChromeBin() {
  if (process.env.CHROME_BIN) {
    return process.env.CHROME_BIN;
  }
  for (const p of LINUX_CHROME_PATHS) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return undefined;
}

module.exports = function (config) {
  const chromeBin = findChromeBin();
  if (chromeBin) {
    process.env.CHROME_BIN = chromeBin;
  }

  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    // Leaving it here just in case we find the fix to the testing hack
    // webpack: {
    //     externals: {
    //         '@openmrs/esm-api': '@openmrs/esm-api',
    //     },
    // },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, './coverage/openmrs-esm-form-entry-app'),
      reports: ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true,
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true,
  });
};
