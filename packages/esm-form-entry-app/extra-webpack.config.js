const { IgnorePlugin, DefinePlugin } = require('webpack');
const { StatsWriterPlugin } = require('webpack-stats-plugin');
const { basename } = require('path');
const singleSpaAngularWebpack = require('single-spa-angular/lib/webpack').default;

const {
  version,
  peerDependencies,
  browser,
  main,
} = require('./package.json');

function getFrameworkVersion() {
  try {
    const { version } = require('@openmrs/esm-framework/package.json');
    return `^${version}`;
  } catch {
    return '4.x';
  }
}

const mode = argv.mode || process.env.NODE_ENV || "development";

module.exports = (angularWebpackConfig, options) => {
  const filename = basename(browser || main);
  const frameworkVersion = getFrameworkVersion();
  const singleSpaWebpackConfig = singleSpaAngularWebpack(angularWebpackConfig, options);

  singleSpaWebpackConfig.output.filename = filename;

  for (const dependency of Object.keys(peerDependencies)) {
    singleSpaWebpackConfig.externals.push(dependency);
  }

  singleSpaWebpackConfig.plugins.push(
    new IgnorePlugin(/^\.\/locale$/, /moment$/),
    new DefinePlugin({
      __VERSION__: mode === production ? JSON.stringify(version) : JSON.stringify(inc(version, 'prerelease', 'local')),
      'process.env.FRAMEWORK_VERSION': JSON.stringify(frameworkVersion),
    }),
    new StatsWriterPlugin({
      filename: `${filename}.buildmanifest.json`,
      stats: {
        all: false,
        chunks: true,
      },
    }),
  );

  return singleSpaWebpackConfig;
};
