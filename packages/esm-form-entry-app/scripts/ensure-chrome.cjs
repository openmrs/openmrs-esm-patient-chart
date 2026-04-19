var fs = require('fs');
var path = require('path');
var browsers = require('@puppeteer/browsers');

function main() {
  var cacheDir = path.join(__dirname, '..', '.cache', 'puppeteer');
  var outputFile = path.join(__dirname, 'chrome-path.json');
  var platform = browsers.detectBrowserPlatform();
  var systemExecutablePath;

  if (!platform) {
    throw new Error('Unable to determine a supported browser platform for test execution.');
  }

  fs.mkdirSync(cacheDir, { recursive: true });

  try {
    systemExecutablePath = browsers.computeSystemExecutablePath({
      browser: browsers.Browser.CHROME,
      channel: browsers.ChromeReleaseChannel.STABLE,
      platform: platform,
    });
  } catch (error) {}

  if (systemExecutablePath && fs.existsSync(systemExecutablePath)) {
    fs.writeFileSync(outputFile, JSON.stringify({ executablePath: systemExecutablePath }, null, 2));
    return null;
  }

  return browsers
    .resolveBuildId(browsers.Browser.CHROME, platform, browsers.BrowserTag.STABLE)
    .then(function (buildId) {
      var executablePath = browsers.computeExecutablePath({
        browser: browsers.Browser.CHROME,
        buildId: buildId,
        cacheDir: cacheDir,
        platform: platform,
      });

      if (fs.existsSync(executablePath)) {
        fs.writeFileSync(outputFile, JSON.stringify({ executablePath: executablePath }, null, 2));
        return null;
      }

      return browsers
        .install({
          browser: browsers.Browser.CHROME,
          buildId: buildId,
          cacheDir: cacheDir,
          platform: platform,
          unpack: true,
        })
        .then(function () {
          fs.writeFileSync(outputFile, JSON.stringify({ executablePath: executablePath }, null, 2));
        });
    });
}

Promise.resolve(main()).catch(function (error) {
  console.error(error);
  process.exit(1);
});